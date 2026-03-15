import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timeline-section',
  standalone: true,
  template: `
    <section class="timeline-section">
      <div class="timeline-image-wrapper">
        <img [src]="image" [alt]="title" class="timeline-image" />
      </div>
    </section>
  `,
  styles: [`
    .timeline-section {
      padding: 1.75rem 1.25rem;
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
    }
  `]
})
export class TimelineSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() image = '';
}

