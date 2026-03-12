import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timeline-section',
  standalone: true,
  template: `
    <section class="timeline-section">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        @if (subtitle) {
          <p class="section-subtitle">{{ subtitle }}</p>
        }
      </div>

      <div class="timeline-image-wrapper">
        <img [src]="image" [alt]="title" class="timeline-image" />
      </div>
    </section>
  `,
  styles: [`
    .timeline-section {
      padding: 2.5rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 300;
      letter-spacing: 0.05em;
      margin: 0 0 0.5rem 0;
      font-family: 'Georgia', serif;
    }

    .section-subtitle {
      font-size: 0.95rem;
      opacity: 0.85;
      margin: 0;
      letter-spacing: 0.05em;
    }

    .timeline-image-wrapper {
      display: flex;
      justify-content: center;
      max-width: 100%;
      overflow: hidden;
      border-radius: 8px;
    }

    .timeline-image {
      width: 100%;
      max-width: 600px;
      height: auto;
      display: block;
      opacity: 0.95;
      transition: opacity 0.3s ease;
    }

    .timeline-image-wrapper:hover .timeline-image {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .timeline-section {
        padding: 1.5rem 1rem;
      }

      .section-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class TimelineSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() image = '';
}

