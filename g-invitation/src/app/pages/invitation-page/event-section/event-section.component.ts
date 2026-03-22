import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSectionItem } from '../../../models/invitation.models';

@Component({
  selector: 'app-event-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-section.component.html',
})
export class EventSectionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() items: EventSectionItem[] = [];
  @Input() dateText = '';
  @Input() time = '';
}

