import { Component, OnInit, OnDestroy, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
import { CdkDropList, CdkDrag, CdkDragDrop, CdkDropListGroup, CdkDragPreview, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { EVENT_CONFIG } from '../../../data/event.data';
import { InviteeRecord } from '../../../models/invitation.models';
import { InviteeService } from '../../../services/invitee.service';

interface TableGroup {
  id: string;
  name: string;
  description?: string;
  invitees: InviteeRecord[];
  isEditing?: boolean;
  editingName?: string;
  editingDescription?: string;
}

@Component({
  selector: 'app-table-organizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    DragDropModule,
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragPreview,
  ],
  templateUrl: './table-organizer.component.html',
  styleUrl: './table-organizer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableOrganizerComponent implements OnInit, OnDestroy {
  protected readonly event = EVENT_CONFIG;
  protected readonly loading = signal(false);
  protected readonly saveInProgress = signal(false);
  protected readonly pendingSaveCount = signal(0);
  protected readonly lastSaveError = signal<string | null>(null);
  protected readonly lastSavedAt = signal<number | null>(null);
  protected readonly autosaveStatusText = computed(() => {
    if (this.saveInProgress()) {
      return 'Saving seating changes...';
    }

    if (this.lastSaveError() && this.pendingSaveCount() > 0) {
      return 'Autosave failed. Retrying...';
    }

    if (this.pendingSaveCount() > 0) {
      return `${this.pendingSaveCount()} unsaved seating change${this.pendingSaveCount() === 1 ? '' : 's'}`;
    }

    return this.lastSavedAt() ? 'All seating changes saved' : 'No pending seating changes';
  });
  protected readonly autosaveStatusTone = computed(() => {
    if (this.lastSaveError() && this.pendingSaveCount() > 0) {
      return 'error';
    }

    if (this.saveInProgress()) {
      return 'saving';
    }

    if (this.pendingSaveCount() > 0) {
      return 'pending';
    }

    return 'saved';
  });
  protected readonly invitees = signal<InviteeRecord[]>([]);
  protected readonly tables = signal<TableGroup[]>([]);
  protected readonly newTableName = signal('');

  private readonly inviteeService = inject(InviteeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly pendingTableAssignments = new Map<string, string | null>();
  private autosaveIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly visibilityChangeHandler = () => {
    if (typeof document !== 'undefined' && document.hidden) {
      void this.flushPendingTableAssignments();
    }
  };
  private readonly beforeUnloadHandler = () => {
    void this.flushPendingTableAssignments();
  };

  ngOnInit(): void {
    this.startAutosaveLoop();
    this.registerAutosaveLifecycleListeners();
    this.loadInviteesAndTables();
  }

  ngOnDestroy(): void {
    this.stopAutosaveLoop();
    this.unregisterAutosaveLifecycleListeners();
    void this.flushPendingTableAssignments();
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
     // Group invitees by table ID assignment
     const tableMap = new Map<string, InviteeRecord[]>();
     const unassigned: InviteeRecord[] = [];

     allInvitees.forEach((invitee) => {
       const tableId = invitee.table;
       if (tableId) {
         if (!tableMap.has(tableId)) {
           tableMap.set(tableId, []);
         }
         tableMap.get(tableId)!.push(invitee);
       } else {
         unassigned.push(invitee);
       }
     });

     // Build table groups primarily from persisted table documents...
     const tables: TableGroup[] = dbTables.map((dbTable) => ({
       id: dbTable.id,
       name: dbTable.name,
       description: dbTable.description || '',
       invitees: tableMap.get(dbTable.id) || [],
       isEditing: false,
       editingName: dbTable.name,
       editingDescription: dbTable.description || '',
     }));

     // ...and include any table IDs that exist only in invitee assignments but not in dbTables.
     const existingIds = new Set(tables.map((t) => t.id));
     for (const [tableId, invitees] of tableMap.entries()) {
       if (!existingIds.has(tableId)) {
         tables.push({
           id: tableId,
           name: tableId, // fallback to ID if table document doesn't exist
           description: '',
           invitees,
           isEditing: false,
           editingName: tableId,
           editingDescription: '',
         });
       }
     }

     // Add unassigned list at the beginning
     tables.unshift({
       id: 'unassigned',
       name: 'Unassigned',
       description: 'Guests who haven\'t been assigned to a table yet',
       invitees: unassigned,
       isEditing: false,
       editingName: 'Unassigned',
       editingDescription: 'Guests who haven\'t been assigned to a table yet',
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
       const tableId = await this.inviteeService.createTable(name, '', this.event.eventSlug);

       const newTable: TableGroup = {
         id: tableId,
         name,
         description: '',
         invitees: [],
         isEditing: false,
         editingName: name,
         editingDescription: '',
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
     if (this.loading()) {
       return;
     }

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

     // Store table ID (not name) in the invitee record
     const tableIdToStore = targetTable.id === 'unassigned' ? null : targetTable.id;

     const updatedInvitee: InviteeRecord = {
       ...invitee,
       table: tableIdToStore ?? undefined,
     };

     const newTables = this.tables().map((table) => {
       if (table.id === sourceTableId) {
         const filtered = table.invitees.filter((i) => i.id !== invitee.id);
         return filtered.length === table.invitees.length
           ? table
           : { ...table, invitees: filtered };
       }

       if (table.id === targetTableId) {
         const hasInvitee = table.invitees.some((i) => i.id === invitee.id);
         return hasInvitee
           ? table
           : { ...table, invitees: [...table.invitees, updatedInvitee] };
       }

       return table;
     });

     this.tables.set(newTables);
     this.queuePendingTableAssignment(invitee.id, tableIdToStore);
   }

   private startAutosaveLoop(): void {
     if (this.autosaveIntervalId) {
       return;
     }

     this.autosaveIntervalId = setInterval(() => {
       void this.flushPendingTableAssignments();
     }, 5000);
   }

   private stopAutosaveLoop(): void {
     if (this.autosaveIntervalId) {
       clearInterval(this.autosaveIntervalId);
       this.autosaveIntervalId = null;
     }
   }

   private registerAutosaveLifecycleListeners(): void {
     if (typeof document !== 'undefined') {
       document.addEventListener('visibilitychange', this.visibilityChangeHandler);
     }

     if (typeof window !== 'undefined') {
       window.addEventListener('beforeunload', this.beforeUnloadHandler);
     }
   }

   private unregisterAutosaveLifecycleListeners(): void {
     if (typeof document !== 'undefined') {
       document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
     }

     if (typeof window !== 'undefined') {
       window.removeEventListener('beforeunload', this.beforeUnloadHandler);
     }
   }

   private queuePendingTableAssignment(inviteeId: string, tableId: string | null): void {
     this.pendingTableAssignments.set(inviteeId, tableId);
     this.pendingSaveCount.set(this.pendingTableAssignments.size);
     this.lastSaveError.set(null);
   }

   private async flushPendingTableAssignments(): Promise<void> {
     if (this.saveInProgress() || this.pendingTableAssignments.size === 0) {
       return;
     }

     const assignmentsToPersist = new Map(this.pendingTableAssignments);
     this.pendingTableAssignments.clear();
     this.pendingSaveCount.set(0);
     this.saveInProgress.set(true);

     try {
       await this.inviteeService.updateInviteeTables(
         Array.from(assignmentsToPersist.entries()).map(([inviteeId, tableId]) => ({ inviteeId, tableId })),
         this.event.eventSlug
       );

       this.lastSaveError.set(null);
       this.lastSavedAt.set(Date.now());
     } catch (error) {
       console.error('Error autosaving table assignments:', error);

       for (const [inviteeId, tableId] of assignmentsToPersist.entries()) {
         if (!this.pendingTableAssignments.has(inviteeId)) {
           this.pendingTableAssignments.set(inviteeId, tableId);
         }
       }

       this.pendingSaveCount.set(this.pendingTableAssignments.size);
       this.lastSaveError.set('Failed to save seating changes. Retrying automatically.');
     } finally {
       this.saveInProgress.set(false);
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

   protected startEditing(table: TableGroup): void {
     this.tables.update((tables) =>
       tables.map((t) =>
         t.id === table.id
           ? {
             ...t,
             isEditing: true,
             editingName: t.name,
             editingDescription: t.description || '',
           }
           : t
       )
     );
   }

   protected cancelEditing(tableId: string): void {
     this.tables.update((tables) =>
       tables.map((t) =>
         t.id === tableId
           ? { ...t, isEditing: false }
           : t
       )
     );
   }

   protected async saveTableEdit(table: TableGroup): Promise<void> {
     if (!table.editingName || !table.editingName.trim()) {
       this.snackBar.open('Table name cannot be empty', 'Close', { duration: 2000 });
       return;
     }

     if (table.id === 'unassigned') {
       this.snackBar.open('Cannot edit the Unassigned table', 'Close', { duration: 2000 });
       return;
     }

     try {
       await this.inviteeService.updateTable(
         table.id,
         table.editingName.trim(),
         table.editingDescription?.trim() || '',
         this.event.eventSlug
       );

       this.tables.update((tables) =>
         tables.map((t) =>
           t.id === table.id
             ? {
               ...t,
               name: table.editingName!.trim(),
               description: table.editingDescription?.trim() || '',
               isEditing: false,
             }
             : t
         )
       );

       this.snackBar.open(`Table updated`, 'Close', { duration: 2000 });
     } catch (error) {
       console.error('Error updating table:', error);
       this.snackBar.open('Failed to update table', 'Close', { duration: 3000 });
     }
   }
}
