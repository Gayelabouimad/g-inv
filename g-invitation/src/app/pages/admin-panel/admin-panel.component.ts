import { Component, OnInit, OnDestroy, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddInvitationDialogComponent } from './add-invitation-dialog/add-invitation-dialog.component';
import { DeleteRsvpConfirmDialogComponent } from './delete-rsvp-confirm-dialog/delete-rsvp-confirm-dialog.component';
import { EVENT_CONFIG } from '../../data/event.data';
import { INVITEES } from '../../data/invitees.data';
import { InviteeRecord } from '../../models/invitation.models';
import { InviteeService } from '../../services/invitee.service';

type AdminRsvpRow = InviteeRecord & { isResponded: boolean; guestNamesDisplay: string };


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  protected readonly event = EVENT_CONFIG;
  protected readonly loading = signal(false);
  protected readonly uploadingInvitees = signal(false);
  protected readonly invitees = signal<InviteeRecord[]>([]);
  protected readonly filter = signal<string>('');

  displayedColumns: string[] = ['guestNames', 'attending', 'attendees', 'message', 'submitted', 'updated', 'invitation', 'delete'];
  lastLoaded = signal('Never');

  protected readonly totalInvitations = computed(() => this.invitees().length);

  // Computed signals to prevent unnecessary re-renders
  protected readonly filteredRsvps = computed(() => {
    const filterValue = this.filter();
    const allInvitees = this.invitees();

    // Transform all invitees to admin rows
    const allItems = allInvitees.map((inv) => ({
      ...inv,
      isResponded: inv.attending !== undefined && inv.attending !== null,
      guestNamesDisplay: inv.guestNames.join(' & '),
    } as AdminRsvpRow));

    // Apply filters
    if (!filterValue) {
      return allItems;
    }

    if (filterValue === 'attending') {
      return allItems.filter(r => r.isResponded && r.attending);
    } else if (filterValue === 'notAttending') {
      return allItems.filter(r => r.isResponded && !r.attending);
    } else if (filterValue === 'pending') {
      return allItems.filter(r => !r.isResponded);
    }

    return allItems;
  });

  protected readonly confirmedCount = computed(() =>
    this.invitees().filter(r => r.attending === true).length
  );

  protected readonly declinedCount = computed(() =>
    this.invitees().filter(r => r.attending === false).length
  );

  protected readonly totalAttendees = computed(() =>
    this.invitees()
      .filter(r => r.attending === true)
      .reduce((sum, r) => {
        const count = Number(r.attendeeCount);
        return sum + (Number.isFinite(count) ? count : 0);
      }, 0)
  );

  protected readonly totalInviteesCount = computed(() =>
    this.invitees().reduce((sum, inv) => sum + inv.numberOfPeople, 0)
  );

  private readonly inviteeService = inject(InviteeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Only load data in the browser, not on the server
    if (isPlatformBrowser(this.platformId)) {
      this.loadInvitees();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadInvitees(): Promise<void> {
    this.loading.set(true);
    try {
      const invitees = await this.inviteeService.getAllInvitees(this.event.eventSlug);
      this.invitees.set(invitees);
      this.lastLoaded.set(new Date().toLocaleTimeString());
      console.log(`Loaded ${invitees.length} invitees from Firestore`);
    } catch (error) {
      console.error('Error loading invitees:', error);
      if (isPlatformBrowser(this.platformId)) {
        this.snackBar.open('Failed to load invitees from Firestore. Please check your connection.', 'Close', { duration: 5000 });
      }
      // No fallback - app requires Firestore data
      this.invitees.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  }

  protected getInvitationLink(inviteeId: string): string {
    return `/${inviteeId}`;
  }

  protected filterStatus(event: MatSelectChange): void {
    this.filter.set((event.value as string) ?? '');
  }

  protected deleteResponse(item: AdminRsvpRow): void {
    // Prevent deletion if loading or item hasn't responded
    if (this.loading() || !item.isResponded) {
      return;
    }

    const dialogRef = this.dialog.open(DeleteRsvpConfirmDialogComponent, {
      data: { guestNamesDisplay: item.guestNamesDisplay },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (!confirmed) {
        return;
      }

      try {
        await this.inviteeService.deleteRsvp(item.id, this.event.eventSlug);
        // Reload from source of truth to keep statistics and table in sync
        await this.loadInvitees();
        this.snackBar.open(`Deleted RSVP for ${item.guestNamesDisplay}`, 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Error deleting RSVP:', error);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open('Failed to delete RSVP. Please try again.', 'Close', { duration: 5000 });
        }
      }
    });
  }

  protected trackByInviteeId(index: number, item: AdminRsvpRow): string {
    return item.id;
  }

  protected exportToCSV(): void {
    const data = this.filteredRsvps();
    const headers = ['Guest Names', 'Attending', 'Attendees', 'Message', 'Submitted', 'Last Updated'];
    const rows = data.map(rsvp => [
      rsvp.guestNamesDisplay,
      rsvp.isResponded ? (rsvp.attending ? 'Yes' : 'No') : 'No Response',
      rsvp.isResponded && rsvp.attending ? rsvp.attendeeCount : '-',
      rsvp.message || '',
      this.formatDate(rsvp.createdAt || ''),
      this.formatDate(rsvp.updatedAt || ''),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rsvp-${this.event.eventSlug}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  protected async uploadInvitees(): Promise<void> {
    if (this.uploadingInvitees()) {
      return;
    }

    this.uploadingInvitees.set(true);
    try {
      // Convert local INVITEES to InviteeRecord format
      const inviteesToUpload = INVITEES.map(inv => ({
        id: inv.id,
        eventSlug: this.event.eventSlug,
        guestNames: inv.guestNames,
        numberOfPeople: inv.numberOfPeople,
      } as InviteeRecord));

      await this.inviteeService.uploadInvitees(inviteesToUpload, this.event.eventSlug);
      if (isPlatformBrowser(this.platformId)) {
        this.snackBar.open(`Successfully uploaded ${inviteesToUpload.length} invitees to Firestore!`, 'Close', { duration: 5000 });
      }
      // Reload invitees from Firestore after upload
      await this.loadInvitees();
    } catch (error) {
      console.error('Error uploading invitees:', error);
      if (isPlatformBrowser(this.platformId)) {
        this.snackBar.open('Failed to upload invitees. Check console for details.', 'Close', { duration: 5000 });
      }
    } finally {
      this.uploadingInvitees.set(false);
    }
  }

  protected async addInvitation(): Promise<void> {
    const dialogRef = this.dialog.open(AddInvitationDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }

      try {
        await this.inviteeService.createInvitee(result, this.event.eventSlug);
        this.snackBar.open(`Successfully added invitation for ${result.guestNames.join(' & ')}`, 'Close', { duration: 3000 });
        // Reload invitees from Firestore
        await this.loadInvitees();
      } catch (error: any) {
        console.error('Error adding invitation:', error);
        if (isPlatformBrowser(this.platformId)) {
          this.snackBar.open(error.message || 'Failed to add invitation. Please try again.', 'Close', { duration: 5000 });
        }
      }
    });
  }
}

