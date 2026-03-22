import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timeline-section',
  standalone: true,
  templateUrl: './timeline-section.component.html',
  styleUrl: './timeline-section.component.css',
})
export class TimelineSectionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() image = '';
}

