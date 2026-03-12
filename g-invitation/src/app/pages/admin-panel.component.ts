import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EVENT_CONFIG } from '../data/event.data';
import { INVITEES } from '../data/invitees.data';
import { RSVPSubmission } from '../models/invitation.models';
import { RsvpService } from '../services/rsvp.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  protected readonly event = EVENT_CONFIG;
  protected readonly loading = signal(false);
  protected readonly rsvps = signal<RSVPSubmission[]>([]);
  protected readonly filter = signal<string>('');

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

    if (!filterValue) return allRsvps;

    if (filterValue === 'attending') {
      return allRsvps.filter(r => r.attending);
    } else if (filterValue === 'notAttending') {
      return allRsvps.filter(r => !r.attending);
    } else if (filterValue === 'pending') {
      const submittedIds = new Set(allRsvps.map(r => r.inviteeId));
      return INVITEES.filter(inv => !submittedIds.has(inv.id)).map(inv => ({
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
      } as RSVPSubmission));
    }

    return allRsvps;
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
      .reduce((sum, r) => sum + (r.attendeeCount || 0), 0);
  }

  protected pendingCount() {
    const submittedIds = new Set(this.rsvps().map(r => r.inviteeId));
    return INVITEES.filter(inv => !submittedIds.has(inv.id)).length;
  }

  protected filterStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filter.set(value);
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

  protected exportToCSV(): void {
    const data = this.filteredRsvps();
    const headers = ['Guest Names', 'Attending', 'Attendees', 'Message', 'Submitted', 'Last Updated'];
    const rows = data.map(rsvp => [
      rsvp.guestNamesDisplay,
      rsvp.attending ? 'Yes' : 'No',
      rsvp.attending ? rsvp.attendeeCount : '-',
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

