import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSectionItem } from '../../models/invitation.models';

@Component({
  selector: 'app-event-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="event-section">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        @if (description) {
          <p class="section-description">{{ description }}</p>
        }
      </div>

      <div class="event-items">
        @for (item of items; track item.label) {
          <div class="event-item">
            <div class="item-header">
              <h3 class="item-label">{{ item.label }}</h3>
              <a 
                class="map-button" 
                [href]="item.mapUrl" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Open in maps"
              >
                📍
              </a>
            </div>
            <p class="item-location">{{ item.locationName }}</p>
            <p class="item-time">{{ item.time }}</p>
          </div>
        }
      </div>

      @if (dateText) {
        <div class="event-date">
          <p class="date-label">{{ dateText }}</p>
          @if (time) {
            <p class="time-label">{{ time }}</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .event-section {
      padding: 2.5rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 300;
      letter-spacing: 0.05em;
      margin: 0 0 0.5rem 0;
      font-family: 'Georgia', serif;
    }

    .section-description {
      font-size: 0.95rem;
      opacity: 0.85;
      margin: 0;
      line-height: 1.6;
    }

    .event-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .event-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .event-item:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-4px);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.8rem;
      gap: 1rem;
    }

    .item-label {
      font-size: 1.1rem;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.03em;
      flex: 1;
      text-align: left;
    }

    .map-button {
      font-size: 1.2rem;
      cursor: pointer;
      text-decoration: none;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .map-button:hover {
      opacity: 1;
    }

    .item-location {
      font-size: 0.9rem;
      opacity: 0.8;
      margin: 0 0 0.3rem 0;
    }

    .item-time {
      font-size: 0.85rem;
      opacity: 0.7;
      margin: 0;
      font-style: italic;
    }

    .event-date {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .date-label {
      font-size: 1rem;
      font-weight: 400;
      margin: 0 0 0.3rem 0;
      letter-spacing: 0.03em;
    }

    .time-label {
      font-size: 0.95rem;
      opacity: 0.85;
      margin: 0;
    }

    @media (max-width: 768px) {
      .event-section {
        padding: 1.5rem 1rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .event-items {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .item-label {
        font-size: 1rem;
      }
    }
  `]
})
export class EventSectionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() items: EventSectionItem[] = [];
  @Input() dateText = '';
  @Input() time = '';
}

