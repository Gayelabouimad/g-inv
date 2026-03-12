import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { EVENT_CONFIG } from '../../data/event.data';
import { INVITEES } from '../../data/invitees.data';
import { RSVPSubmission } from '../../models/invitation.models';
import { RsvpService } from '../../services/rsvp.service';

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
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  protected readonly event = EVENT_CONFIG;
  protected readonly loading = signal(false);
  protected readonly rsvps = signal<RSVPSubmission[]>([]);
  protected readonly filter = signal<string>('');

  displayedColumns: string[] = ['guestNames', 'attending', 'attendees', 'message', 'submitted', 'updated', 'invitation'];
  lastLoaded = signal('Never');
  totalInvitations = INVITEES.length;

  private readonly rsvpService = inject(RsvpService);

  ngOnInit(): void {
    this.loadRsvps();
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
      alert('Failed to load RSVPs. Check console for details.');
    } finally {
      this.loading.set(false);
    }
  }

  protected filteredRsvps() {
    const filterValue = this.filter();
    const allRsvps = this.rsvps();
    const submittedIds = new Set(allRsvps.map(r => r.inviteeId));

    // Get all items (submitted + non-submitted)
    const allItems = [
      ...allRsvps.map(r => ({ ...r, isResponded: true })),
      ...INVITEES.filter(inv => !submittedIds.has(inv.id)).map(inv => ({
        inviteeId: inv.id,
        accessToken: inv.accessToken,
        eventSlug: this.event.eventSlug,
        guestNames: inv.guestNames,
        guestNamesDisplay: inv.guestNames.join(' & '),
        allowedPeople: inv.numberOfPeople,
        attending: false,
        attendeeCount: 0,
        message: '',
        submittedFromRoute: inv.routeSlug,
        isResponded: false,
      } as RSVPSubmission & { isResponded: boolean }),
      )
    ];

    // Apply filters
    if (!filterValue) {
      // Default: show all
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
  }

  protected confirmedCount() {
    return this.rsvps().filter(r => r.attending).length;
  }

  protected declinedCount() {
    return this.rsvps().filter(r => !r.attending).length;
  }

  protected totalAttendees() {
    return this.rsvps()
      .filter(r => r.attending)
      .reduce((sum, r) => {
        const count = Number(r.attendeeCount);
        return sum + (Number.isFinite(count) ? count : 0);
      }, 0);
  }

  protected pendingCount() {
    const submittedIds = new Set(this.rsvps().map(r => r.inviteeId));
    return INVITEES.filter(inv => !submittedIds.has(inv.id)).length;
  }

  protected filterStatus(event: MatSelectChange): void {
    this.filter.set((event.value as string) ?? '');
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

  protected getInvitationLink(routeSlug: string): string {
    return `/${this.event.eventSlug}/${routeSlug}`;
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

