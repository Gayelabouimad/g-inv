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
import { InviteeRecord, TableRecord } from '../../../models/invitation.models';
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
  protected readonly tables = signal<TableGroup[]>([]);
  protected readonly unassignedTable = computed(() => this.tables().find((table) => table.id === 'unassigned') ?? null);
  protected readonly assignedTables = computed(() =>
    this.tables()
      .filter((table) => table.id !== 'unassigned')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }))
  );
  protected readonly dropListIds = computed(() => this.tables().map((table) => table.id));
  protected readonly newTableName = signal('');
  protected readonly hideDeclinedInvitees = signal(false);

  private readonly inviteeService = inject(InviteeService);
  private readonly snackBar = inject(MatSnackBar);
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

    let dbTables: TableRecord[];
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

  private initializeTables(allInvitees: InviteeRecord[], dbTables: TableRecord[]): void {
    const inviteesById = new Map(allInvitees.map((invitee) => [invitee.id, invitee]));
    const assignedInviteeIds = new Set<string>();
    const hasTableInviteeLinks = dbTables.some((table) => Array.isArray(table.inviteeIds));

    const legacyAssignments = new Map<string, InviteeRecord[]>();
    if (!hasTableInviteeLinks) {
      for (const invitee of allInvitees) {
        const legacyTableId = (invitee as InviteeRecord & { table?: string }).table;
        if (!legacyTableId) {
          continue;
        }

        if (!legacyAssignments.has(legacyTableId)) {
          legacyAssignments.set(legacyTableId, []);
        }
        legacyAssignments.get(legacyTableId)!.push(invitee);
      }
    }

    const tables: TableGroup[] = dbTables.map((dbTable) => {
      const linkedInvitees = (dbTable.inviteeIds || [])
        .map((inviteeId) => inviteesById.get(inviteeId))
        .filter((invitee): invitee is InviteeRecord => !!invitee);

      const invitees = linkedInvitees.length > 0 ? linkedInvitees : (legacyAssignments.get(dbTable.id) || []);

      invitees.forEach((invitee) => assignedInviteeIds.add(invitee.id));

      return {
        id: dbTable.id,
        name: dbTable.name,
        description: dbTable.description || '',
        invitees,
        isEditing: false,
        editingName: dbTable.name,
        editingDescription: dbTable.description || '',
      };
    });

    if (!hasTableInviteeLinks) {
      const existingIds = new Set(tables.map((table) => table.id));
      for (const [tableId, invitees] of legacyAssignments.entries()) {
        if (existingIds.has(tableId)) {
          continue;
        }

        invitees.forEach((invitee) => assignedInviteeIds.add(invitee.id));
        tables.push({
          id: tableId,
          name: tableId,
          description: '',
          invitees,
          isEditing: false,
          editingName: tableId,
          editingDescription: '',
        });
      }
    }

    const unassigned = allInvitees.filter((invitee) => !assignedInviteeIds.has(invitee.id));

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
          : { ...table, invitees: [...table.invitees, invitee] };
      }

      return table;
    });

    this.tables.set(newTables);
    this.queuePendingTableAssignment();
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

  private queuePendingTableAssignment(): void {
    this.pendingSaveCount.update((count) => count + 1);
    this.lastSaveError.set(null);
  }

  private async flushPendingTableAssignments(): Promise<void> {
    if (this.saveInProgress() || this.pendingSaveCount() === 0) {
      return;
    }

    const changesToPersist = this.pendingSaveCount();
    this.pendingSaveCount.set(0);
    this.saveInProgress.set(true);

    const tableAssignments = this.tables()
      .filter((table) => table.id !== 'unassigned')
      .map((table) => ({
        tableId: table.id,
        inviteeIds: table.invitees.map((invitee) => invitee.id),
      }));

    try {
      await this.inviteeService.updateTableInvitees(tableAssignments, this.event.eventSlug);
      this.lastSaveError.set(null);
      this.lastSavedAt.set(Date.now());
    } catch (error) {
      console.error('Error autosaving table assignments:', error);
      this.pendingSaveCount.update((count) => count + changesToPersist);
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
    return this.getAttendeeCount(invitees);
  }

  protected getTotalTableAttendeeCapacity(invitees: InviteeRecord[]): number {
    return invitees.reduce((sum, invitee) => {
      if (invitee.attending === false) {
        return sum;
      }

      if (invitee.attending === true) {
        return sum + (invitee.attendeeCount ?? invitee.numberOfPeople ?? 0);
      }

      return sum + (invitee.numberOfPeople ?? 0);
    }, 0);
  }

  protected getVisibleInvitees(invitees: InviteeRecord[]): InviteeRecord[] {
    if (!this.hideDeclinedInvitees()) {
      return invitees;
    }

    return invitees.filter((invitee) => invitee.attending !== false);
  }

  protected getDeclinedCount(invitees: InviteeRecord[]): number {
    return invitees.filter((invitee) => invitee.attending === false).length;
  }

  protected toggleDeclinedVisibility(): void {
    this.hideDeclinedInvitees.update((hideDeclined) => !hideDeclined);
  }

  protected getConnectedDropListIds(currentTableId: string): string[] {
    return this.dropListIds().filter((tableId) => tableId !== currentTableId);
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
