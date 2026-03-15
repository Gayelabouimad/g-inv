import { Component, Input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
}

@Component({
  selector: 'app-countdown-section',
  standalone: true,
  template: `
    <div class="countdown-container">
      <h2 class="countdown-label">Counting down to forever</h2>

      @if (!isComplete()) {
        <div class="countdown-grid" aria-label="Countdown until wedding day">
          <div class="countdown-item">
            <span class="countdown-value">{{ countdownParts().days }}</span>
            <span class="countdown-unit">Days</span>
          </div>

          <div class="countdown-separator">:</div>

          <div class="countdown-item">
            <span class="countdown-value">{{ twoDigit(countdownParts().hours) }}</span>
            <span class="countdown-unit">Hours</span>
          </div>

          <div class="countdown-separator">:</div>

          <div class="countdown-item">
            <span class="countdown-value">{{ twoDigit(countdownParts().minutes) }}</span>
            <span class="countdown-unit">Minutes</span>
          </div>
        </div>
      } @else {
        <p class="countdown-complete">Today is the day!</p>
      }

    </div>
  `,
  styles: [`
    .countdown-container {
      text-align: center;
      padding: 1rem 0 0.75rem;
      margin: 0.5rem 0 1rem;
      width: 100%;
    }

    .countdown-label {
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      opacity: 0.78;
      margin: 0 0 0.75rem;
    }

    .countdown-grid {
      display: inline-flex;
      align-items: stretch;
      justify-content: center;
      gap: 0.5rem;
      max-width: 100%;
    }

    .countdown-item {
      min-width: 74px;
      padding: 0.7rem 0.6rem 0.55rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.17);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    }

    .countdown-value {
      font-size: 1.4rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
    }

    .countdown-unit {
      margin-top: 0.35rem;
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.75;
    }

    .countdown-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      opacity: 0.5;
      transform: translateY(-3px);
    }

    .countdown-complete {
      margin: 0;
      font-size: 1.05rem;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .countdown-footnote {
      margin: 0.75rem 0 0;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.62;
    }

    @media (max-width: 768px) {
      .countdown-item {
        min-width: 64px;
        padding: 0.6rem 0.5rem 0.45rem;
      }

      .countdown-value {
        font-size: 1.15rem;
      }

      .countdown-unit {
        font-size: 0.62rem;
      }

      .countdown-separator {
        font-size: 1rem;
      }
    }
  `]
})
export class CountdownSectionComponent implements OnChanges, OnDestroy {
  @Input() targetDate!: Date;

  private readonly countdownState = signal<CountdownParts>({ days: 0, hours: 0, minutes: 0 });
  private readonly completeState = signal(false);
  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetDate']) {
      this.startCountdownTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private startCountdownTimer(): void {
    if (typeof window === 'undefined') return;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (!this.targetDate || Number.isNaN(this.targetDate.getTime())) {
      this.completeState.set(false);
      this.countdownState.set({ days: 0, hours: 0, minutes: 0 });
      return;
    }

    const update = () => {
      if (this.targetDate) {
        const now = new Date().getTime();
        const target = this.targetDate.getTime();
        const diff = target - now;

        if (diff <= 0) {
          this.completeState.set(true);
          this.countdownState.set({ days: 0, hours: 0, minutes: 0 });
          return;
        }

        this.completeState.set(false);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        this.countdownState.set({ days, hours, minutes });
      }
    };

    update();
    this.timerId = setInterval(update, 60000); // Update every minute
  }

  protected countdownParts(): CountdownParts {
    return this.countdownState();
  }

  protected isComplete(): boolean {
    return this.completeState();
  }

  protected twoDigit(value: number): string {
    return value.toString().padStart(2, '0');
  }
}

