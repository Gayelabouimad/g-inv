import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registry-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registry-section.component.html',
  styleUrl: './registry-section.component.css',
})
export class RegistrySectionComponent {
  @Input() title = '';
  @Input() text = '';
  @Input() name = '';
  @Input() accountNumber = '';

  protected copiedState = signal(false);

  protected copyToClipboard(): void {
    if (!this.accountNumber) return;

    navigator.clipboard.writeText(this.accountNumber).then(
      () => {
        this.copiedState.set(true);
        setTimeout(() => {
          this.copiedState.set(false);
        }, 2000);
      },
      (error) => {
        console.error('Failed to copy to clipboard:', error);
      }
    );
  }
}

