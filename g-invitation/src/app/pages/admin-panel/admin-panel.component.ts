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
import { DeleteRsvpConfirmDialogComponent } from './delete-rsvp-confirm-dialog/delete-rsvp-confirm-dialog.component';
import { EVENT_CONFIG } from '../../data/event.data';
import { INVITEES } from '../../data/invitees.data';
import { RSVPSubmission } from '../../models/invitation.models';
import { RsvpService } from '../../services/rsvp.service';

type AdminRsvpRow = RSVPSubmission & { isResponded: boolean };


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
  protected readonly rsvps = signal<RSVPSubmission[]>([]);
  protected readonly filter = signal<string>('');

  displayedColumns: string[] = ['guestNames', 'attending', 'attendees', 'message', 'submitted', 'updated', 'invitation', 'delete'];
  lastLoaded = signal('Never');
  totalInvitations = INVITEES.length;

  // Computed signals to prevent unnecessary re-renders
  protected readonly filteredRsvps = computed(() => {
    const filterValue = this.filter();
    const allRsvps = this.rsvps();
    const submittedIds = new Set(allRsvps.map(r => r.inviteeId));

    // Get all items (submitted + non-submitted)
    const allItems = [
      ...allRsvps.map((r) => ({ ...r, isResponded: true } as AdminRsvpRow)),
      ...INVITEES.filter(inv => !submittedIds.has(inv.id)).map(inv => ({
        inviteeId: inv.id,
        eventSlug: this.event.eventSlug,
        guestNames: inv.guestNames,
        guestNamesDisplay: inv.guestNames.join(' & '),
        allowedPeople: inv.numberOfPeople,
        attending: false,
        attendeeCount: 0,
        message: '',
        submittedFromRoute: inv.id,
        isResponded: false,
      } as AdminRsvpRow),
      )
    ];

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
    this.rsvps().filter(r => r.attending).length
  );

  protected readonly declinedCount = computed(() => 
    this.rsvps().filter(r => !r.attending).length
  );

  protected readonly totalAttendees = computed(() => 
    this.rsvps()
      .filter(r => r.attending)
      .reduce((sum, r) => {
        const count = Number(r.attendeeCount);
        return sum + (Number.isFinite(count) ? count : 0);
      }, 0)
  );

  protected readonly pendingCount = computed(() => {
    const submittedIds = new Set(this.rsvps().map(r => r.inviteeId));
    return INVITEES.filter(inv => !submittedIds.has(inv.id)).length;
  });

  private readonly rsvpService = inject(RsvpService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Only load RSVPs in the browser, not on the server
    if (isPlatformBrowser(this.platformId)) {
      this.loadRsvps();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadRsvps(): Promise<void> {
    this.loading.set(true);
    try {
      const allRsvps: RSVPSubmission[] = [];
      
      // Load all RSVPs for this event
      for (const invitee of INVITEES) {
        const rsvp = await this.rsvpService.read(invitee.id, this.event.eventSlug);
        if (rsvp) {
          allRsvps.push(rsvp);
        }
      }

      // Sort by most recent update
      allRsvps.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || '').getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || '').getTime();
        return dateB - dateA;
      });

      this.rsvps.set(allRsvps);
      this.lastLoaded.set(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading RSVPs:', error);
      if (isPlatformBrowser(this.platformId)) {
        this.snackBar.open('Failed to load RSVPs. Check console for details.', 'Close', { duration: 5000 });
      }
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
    return `/${this.event.eventSlug}/${inviteeId}`;
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
        await this.rsvpService.delete(item.inviteeId, this.event.eventSlug);
        // Reload from source of truth to keep statistics and table in sync.
        await this.loadRsvps();
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
    return item.inviteeId;
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
}

