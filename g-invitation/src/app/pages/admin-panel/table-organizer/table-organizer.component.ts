import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDropList, CdkDrag, CdkDragDrop, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { EVENT_CONFIG } from '../../../data/event.data';
import { InviteeRecord } from '../../../models/invitation.models';
import { InviteeService } from '../../../services/invitee.service';

interface TableGroup {
  id: string;
  name: string;
  invitees: InviteeRecord[];
}

@Component({
  selector: 'app-table-organizer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
  ],
  templateUrl: './table-organizer.component.html',
  styleUrl: './table-organizer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOrganizerComponent implements OnInit {
  protected readonly event = EVENT_CONFIG;
  protected readonly loading = signal(false);
  protected readonly invitees = signal<InviteeRecord[]>([]);
  protected readonly tables = signal<TableGroup[]>([]);
  protected readonly newTableName = signal('');

  private readonly inviteeService = inject(InviteeService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadInviteesAndTables();
  }

  private async loadInviteesAndTables(): Promise<void> {
    this.loading.set(true);

    const allInvitees = await this.fetchInviteesWithRetry();
    if (!allInvitees) {
      this.loading.set(false);
      return;
    }

    this.invitees.set(allInvitees);

    let dbTables: any[];
    try {
      dbTables = await this.inviteeService.getTables(this.event.eventSlug);
    } catch (error) {
      console.warn('Could not load tables collection. Falling back to invitee table assignments.', error);
      dbTables = [];
    }

    try {
      this.initializeTables(allInvitees, dbTables);
    } catch (error) {
      console.error('Error initializing tables:', error);
      this.tables.set([
        {
          id: 'unassigned',
          name: 'Unassigned',
          invitees: allInvitees,
        },
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchInviteesWithRetry(): Promise<InviteeRecord[] | null> {
    try {
      return await this.inviteeService.getAllInvitees(this.event.eventSlug);
    } catch (firstError) {
      console.warn('First attempt to load invitees failed, retrying once...', firstError);

      try {
        return await this.inviteeService.getAllInvitees(this.event.eventSlug);
      } catch (secondError) {
        console.error('Error loading invitees after retry:', secondError);
        return null;
      }
    }
  }

  private initializeTables(allInvitees: InviteeRecord[], dbTables: any[]): void {
    // Group invitees by table assignment
    const tableMap = new Map<string, InviteeRecord[]>();
    const unassigned: InviteeRecord[] = [];

    allInvitees.forEach((invitee) => {
      const tableName = invitee.table;
      if (tableName) {
        if (!tableMap.has(tableName)) {
          tableMap.set(tableName, []);
        }
        tableMap.get(tableName)!.push(invitee);
      } else {
        unassigned.push(invitee);
      }
    });

    // Build table groups primarily from persisted table documents...
    const tables: TableGroup[] = dbTables.map((dbTable) => ({
      id: dbTable.id,
      name: dbTable.name,
      invitees: tableMap.get(dbTable.name) || [],
    }));

    // ...and include any table names that exist only in invitee assignments.
    const existingNames = new Set(tables.map((t) => t.name));
    for (const [name, invitees] of tableMap.entries()) {
      if (!existingNames.has(name)) {
        tables.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          invitees,
        });
      }
    }

    // Add unassigned list at the beginning
    tables.unshift({
      id: 'unassigned',
      name: 'Unassigned',
      invitees: unassigned,
    });

    this.tables.set(tables);
  }

  protected addTable(): void {
    const name = this.newTableName().trim();
    if (!name) {
      this.snackBar.open('Please enter a table name', 'Close', { duration: 2000 });
      return;
    }

    this.createTableInDb(name);
  }

  private async createTableInDb(name: string): Promise<void> {
    try {
      const tableId = await this.inviteeService.createTable(name, this.event.eventSlug);

      const newTable: TableGroup = {
        id: tableId,
        name,
        invitees: [],
      };

      this.tables.update((tables) => [...tables, newTable]);
      this.newTableName.set('');
      this.snackBar.open(`Table "${name}" created`, 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error creating table:', error);
      this.snackBar.open('Failed to create table', 'Close', { duration: 3000 });
    }
  }

  protected async drop(event: CdkDragDrop<InviteeRecord[]>): Promise<void> {
    const invitee = event.item.data;
    const sourceTableId = event.previousContainer.id;
    const targetTableId = event.container.id;

    if (sourceTableId === targetTableId) {
      return;
    }

    const targetTable = this.tables().find((t) => t.id === targetTableId);
    if (!targetTable) {
      console.error('Target table not found:', targetTableId);
      return;
    }

    const tableName = targetTable.id === 'unassigned' ? null : targetTable.name;

    try {
      await this.inviteeService.updateInviteeTable(invitee.id, tableName, this.event.eventSlug);

      // Keep local state aligned with persisted assignment - batch updates to minimize reflows
      const updatedInvitee: InviteeRecord = {
        ...invitee,
        table: tableName ?? undefined,
      };

      // Build new tables array in a single pass to minimize signal updates
      const newTables = this.tables().map((table) => {
        // Remove from source table
        if (table.id === sourceTableId) {
          const filtered = table.invitees.filter((i) => i.id !== invitee.id);
          return filtered.length === table.invitees.length
            ? table
            : { ...table, invitees: filtered };
        }

        // Add to target table
        if (table.id === targetTableId) {
          const hasInvitee = table.invitees.some((i) => i.id === invitee.id);
          return hasInvitee
            ? table
            : { ...table, invitees: [...table.invitees, updatedInvitee] };
        }

        return table;
      });

      this.tables.set(newTables);

      this.snackBar.open(
        `Moved ${invitee.guestNamesDisplay} to ${tableName || 'Unassigned'}`,
        'Close',
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Error updating invitee table:', error);
      this.snackBar.open('Failed to update table assignment', 'Close', { duration: 3000 });
    }
  }

  protected getAttendeeCount(invitees: InviteeRecord[]): number {
    return invitees.reduce((sum, inv) => {
      if (inv.attending && inv.attendeeCount) {
        return sum + inv.attendeeCount;
      }
      return sum;
    }, 0);
  }

  protected getResponseCount(invitees: InviteeRecord[]): number {
    return invitees.filter(inv => inv.attending === true).length;
  }

  protected async removeTable(tableId: string): Promise<void> {
    const table = this.tables().find(t => t.id === tableId);
    if (!table) return;

    if (table.invitees.length > 0) {
      this.snackBar.open('Cannot delete table with invitees. Move all invitees first.', 'Close', { duration: 3000 });
      return;
    }

    try {
      await this.inviteeService.deleteTable(tableId, this.event.eventSlug);
      this.tables.update(tables => tables.filter(t => t.id !== tableId));
      this.snackBar.open(`Table "${table.name}" removed`, 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error deleting table:', error);
      this.snackBar.open('Failed to delete table', 'Close', { duration: 3000 });
    }
  }
}
