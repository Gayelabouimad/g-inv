import { Component, Input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
}

@Component({
  selector: 'app-countdown-section',
  standalone: true,
  templateUrl: './countdown-section.component.html',
  styleUrl: './countdown-section.component.css',
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
    this.timerId = setInterval(update, 60000);
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

