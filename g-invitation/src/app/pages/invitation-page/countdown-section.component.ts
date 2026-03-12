import { Component, Input, computed } from '@angular/core';
import { signal } from '@angular/core';

@Component({
  selector: 'app-countdown-section',
  standalone: true,
  template: `
    <div class="countdown-container">
      <h2 class="countdown-label">Wedding Day</h2>
      <p class="countdown-text">{{ countdownDisplay() }}</p>
    </div>
  `,
  styles: [`
    .countdown-container {
      text-align: center;
      padding: 1.5rem 0;
      margin: 1rem 0;
    }

    .countdown-label {
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.8;
      margin: 0 0 0.5rem 0;
    }

    .countdown-text {
      font-size: 1.1rem;
      font-weight: 300;
      margin: 0;
      letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
      .countdown-label {
        font-size: 0.8rem;
      }

      .countdown-text {
        font-size: 1rem;
      }
    }
  `]
})
export class CountdownSectionComponent {
  @Input() targetDate: Date | null = null;

  private readonly countdown = signal('');

  readonly countdownDisplay = computed(() => {
    if (!this.targetDate) return '';
    return this.calculateCountdown(this.targetDate);
  });

  constructor() {
    this.startCountdownTimer();
  }

  private startCountdownTimer(): void {
    if (typeof window === 'undefined') return;

    const update = () => {
      if (this.targetDate) {
        const now = new Date().getTime();
        const target = this.targetDate.getTime();
        const diff = target - now;

        if (diff <= 0) {
          this.countdown.set('Today is the day!');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

        this.countdown.set(parts.join(', '));
      }
    };

    update();
    setInterval(update, 60000); // Update every minute
  }

  private calculateCountdown(targetDate: Date): string {
    return this.countdown();
  }
}

