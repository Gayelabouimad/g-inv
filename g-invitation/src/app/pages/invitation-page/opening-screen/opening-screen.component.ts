import { Component, Input } from '@angular/core';
import { CountdownSectionComponent } from '../countdown-section/countdown-section.component';

@Component({
  selector: 'app-opening-screen',
  standalone: true,
  imports: [CountdownSectionComponent],
  templateUrl: './opening-screen.component.html',
  styleUrl: './opening-screen.component.css',
})
export class OpeningScreenComponent {
  @Input() coupleName = '';
  @Input() titleLine = '';
  @Input() targetDate!: Date;

  getGoogleCalendarUrl(): string {
    const eventTitle = `${this.coupleName} Wedding`;
    const location = 'Domaine de Bherdok - Beit Chabab, Lebanon';
    const details = `Join us for the wedding celebration of ${this.coupleName}! The festivities will commence with a gathering at 2:30 PM, followed by the ceremony and dinner at 6:00 PM.`;

    // Format date for Google Calendar (YYYYMMDDTHHMMSS)
    const startDate = this.formatDateForGoogle(this.targetDate);
    // Event duration: 7.5 hours (from 5:30 PM July 18 to 1:00 AM July 19)
    const endDate = this.formatDateForGoogle(new Date(this.targetDate.getTime() + 7.5 * 60 * 60 * 1000));

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle,
      dates: `${startDate}/${endDate}`,
      details: details,
      location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private formatDateForGoogle(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
}

