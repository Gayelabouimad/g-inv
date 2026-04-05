import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() isVisible = true;
  @Input() targetDate!: Date;

  @Output() tapStart = new EventEmitter<void>();

  onTap(): void {
    this.tapStart.emit();
  }
}

