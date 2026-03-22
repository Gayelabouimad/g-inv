import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thank-you-section',
  standalone: true,
  templateUrl: './thank-you-section.component.html',
  styleUrl: './thank-you-section.component.css',
})
export class ThankYouSectionComponent {
  @Input() attending = false;
  @Input() attendeeCount = 0;
  @Input() message = '';
}

