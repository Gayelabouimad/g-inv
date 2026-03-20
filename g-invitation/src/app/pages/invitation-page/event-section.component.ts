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
            <h3 class="item-label">{{ item.label }}</h3>
            <p class="item-location">{{ item.locationName }}</p>
            <p class="item-time">{{ item.time }}</p>
            <a 
              class="map-button" 
              [href]="item.mapUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Open in maps"
              aria-label="Open location in maps"
            >
              <svg aria-hidden="true" focusable="false" class="map-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 21s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                <circle cx="12" cy="10" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
              </svg>
              <span>View map</span>
            </a>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .event-section {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      padding: 1.25rem;
      box-sizing: border-box;
      animation: fadeInContent 500ms ease-out both;
    }

    .section-header {
      margin-bottom: 0.4rem;
      text-align: center;
    }

    .section-kicker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      padding: 0.25rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.07);
      font-family: 'Limelight', sans-serif;
      font-size: 0.58rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .section-title {
      font-family: 'Great Vibes', cursive;
      font-size: clamp(2rem, 8vw, 3rem);
      font-weight: 300;
      letter-spacing: 0.01em;
      margin: 0 0 0.5rem 0;
      line-height: 1.1;
      text-wrap: balance;
    }

    .section-description {
      max-width: 38ch;
      margin: 0 auto;
      font-size: 0.92rem;
      opacity: 0.85;
      line-height: 1.55;
      text-wrap: pretty;
    }

    .event-date {
      text-align: center;
      margin: 0 auto;
      padding: 0.8rem 1rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
      width: min(400px, 100%);
    }

    .event-items {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.85rem;
    }

    .event-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-rows: auto auto auto;
      column-gap: 0.9rem;
      row-gap: 0.25rem;
      align-items: center;
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04));
      border: 1px solid rgba(255, 255, 255, 0.17);
      padding: 1rem;
      border-radius: 16px;
      backdrop-filter: blur(9px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      transition: transform 220ms ease, border-color 220ms ease, background-color 220ms ease;
    }

    .event-item:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .item-label {
      grid-column: 1;
      grid-row: 1;
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0;
      letter-spacing: 0.04em;
      flex: 1;
      text-align: left;
      font-family: 'Quicksand', sans-serif;
      text-transform: uppercase;
    }

    .map-button {
      grid-column: 2;
      grid-row: 1 / 4;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.35rem;
      min-height: 100%;
      min-width: 88px;
      padding: 0.7rem 0.9rem;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background-color 180ms ease, border-color 180ms ease;
      flex-shrink: 0;
    }

    .map-icon {
      width: 1.8rem;
      height: 1.8rem;
      opacity: 0.96;
    }

    .map-button span {
      line-height: 1;
    }

    .map-button:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .item-location {
      grid-column: 1;
      grid-row: 2;
      font-size: 0.94rem;
      opacity: 0.9;
      margin: 0 0 0.3rem 0;
      line-height: 1.35;
    }

    .item-time {
      grid-column: 1;
      grid-row: 3;
      font-size: 0.84rem;
      opacity: 0.78;
      margin: 0;
      font-style: italic;
    }

    .date-label {
      font-size: 0.94rem;
      font-weight: 400;
      margin: 0 0 0.3rem 0;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'Limelight', sans-serif;
    }

    .time-label {
      font-size: 0.94rem;
      opacity: 0.85;
      margin: 0;
      font-style: italic;
    }

    @keyframes fadeInContent {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .event-section {
        gap: 0.9rem;
        padding: 1rem;
      }

      .section-title {
        margin-bottom: 0.4rem;
      }

      .event-item {
        padding: 0.9rem;
      }

      .event-item {
        column-gap: 0.7rem;
      }

      .item-label {
        font-size: 1rem;
        font-weight: 900;
      }

      .item-location {
        font-size: 0.88rem;
      }

      .date-label,
      .time-label {
        font-size: 0.86rem;
      }
    }

    @media (max-width: 420px) {
      .section-kicker {
        font-size: 0.54rem;
      }

      .event-section {
        padding: 0.9rem;
      }

      .map-button {
        min-width: 78px;
        font-size: 0.68rem;
        padding: 0.55rem 0.62rem;
      }

      .map-icon {
        width: 1.6rem;
        height: 1.6rem;
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

