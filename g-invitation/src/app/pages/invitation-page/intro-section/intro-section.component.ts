import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-section.component.html',
})
export class IntroSectionComponent {
  @Input() coupleName = '';
  @Input() quote = '';
  @Input() quoteSource = '';
  @Input() families: string[] = [];
  @Input() introText = '';
  @Input() dateTimeImage = '';

  protected resolvedDateTimeImage(): string {
    return this.dateTimeImage.trim();
  }
}

