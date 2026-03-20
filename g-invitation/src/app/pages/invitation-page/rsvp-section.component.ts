import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-rsvp-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="rsvp-section">
      <div class="section-header">
        <h2 class="section-title">RSVP</h2>
        <p class="deadline">{{ deadlineText }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="rsvp-form">
        <div class="form-group">
          <label class="form-label">Guest Names</label>
          <p class="guest-names">{{ invitee?.guestNames.join(' & ') }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Will you attend?</label>
          <div class="button-group">
            <button
              type="button"
              class="choice-button"
              [class.active]="form.get('attending')?.value === true"
              (click)="setAttending(true)"
              [disabled]="submittingState()"
            >
              Yes, I'll be there ✓
            </button>
            <button
              type="button"
              class="choice-button"
              [class.active]="form.get('attending')?.value === false"
              (click)="setAttending(false)"
              [disabled]="submittingState()"
            >
              Sorry, can't make it
            </button>
          </div>
        </div>

        @if (form.get('attending')?.value === true) {
          <div class="form-group">
            <label class="form-label">Number of attendees</label>
            <select formControlName="attendeeCount" class="form-select">
              @for (n of attendeeOptions(); track n) {
                <option [value]="n">{{ n }} {{ n === 1 ? 'person' : 'people' }}</option>
              }
            </select>
          </div>
        }

        <div class="form-group">
          <label class="form-label">Message (optional)</label>
          <textarea
            formControlName="message"
            class="form-textarea"
            [attr.maxlength]="maxMessageLength"
            placeholder="Share your wishes or any special notes..."
          ></textarea>
          <p class="char-count">
            {{ (form.get('message')?.value?.length ?? 0) }} / {{ maxMessageLength }}
          </p>
        </div>

        <button
          type="submit"
          class="submit-button"
          [disabled]="!form.valid || submittingState()"
        >
          @if (submittingState()) {
            Submitting...
          } @else {
            Submit RSVP
          }
        </button>

        @if (errorState()) {
          <p class="error-message">{{ errorState() }}</p>
        }
      </form>
    </section>
  `,
  styles: [`
    .rsvp-section {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      padding: 1.25rem;
      box-sizing: border-box;
      animation: fadeInContent 500ms ease-out both;
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: 'Great Vibes', cursive;
      font-size: clamp(2rem, 8vw, 3rem);
      font-weight: 400;
      letter-spacing: 0.01em;
      margin: 0 0 0.5rem 0;
      line-height: 1.1;
      text-wrap: balance;
    }

    .deadline {
      font-size: 0.9rem;
      opacity: 0.8;
      margin: 0;
      letter-spacing: 0.03em;
    }

    .rsvp-form {
      max-width: 500px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .form-label {
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .guest-names {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0;
      padding: 0.8rem;
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04));
      border: 1px solid rgba(255, 255, 255, 0.17);
      border-radius: 16px;
      backdrop-filter: blur(9px);
    }

    .button-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .choice-button {
      padding: 1rem 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      cursor: pointer;
      border-radius: 16px;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.03em;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .choice-button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .choice-button.active {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .choice-button:active:not(:disabled) {
      transform: translateY(1px);
    }

    .choice-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-select,
    .form-textarea {
      padding: 0.8rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      color: inherit;
      border-radius: 16px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.15);
    }

    .form-select {
      cursor: pointer;
    }

    .form-select option {
      background: #333;
      color: #fff;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
      max-height: 150px;
    }

    .char-count {
      font-size: 0.8rem;
      opacity: 0.6;
      margin: 0;
      text-align: right;
    }

    .submit-button {
      padding: 1rem 2rem;
      background: var(--accent-color, #d6c3a5);
      color: rgba(0, 0, 0, 0.7);
      border: none;
      border-radius: 16px;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 0.5rem;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: rgba(255, 107, 107, 0.9);
      font-size: 0.9rem;
      margin: 0;
      text-align: center;
    }

    @keyframes fadeInContent {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .rsvp-section {
        padding: 1rem;
      }

      .section-title {
        margin-bottom: 0.4rem;
      }

      .button-group {
        grid-template-columns: 1fr;
      }

      .choice-button {
        padding: 0.8rem 1rem;
        font-size: 0.85rem;
      }

      .rsvp-form {
        gap: 1rem;
      }

      .form-group {
        gap: 0.6rem;
      }
    }
  `],
  host: {
    '[style.--accent-color]': '"#d6c3a5"'
  }
})
export class RsvpSectionComponent implements OnInit {
  @Input() invitee: any;
  @Input() deadlineText = '';
  @Input() maxMessageLength = 120;
  @Input() accentColor = '#d6c3a5';
  @Output() onRsvpSubmit = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  
  protected readonly submittingState = signal(false);
  protected readonly errorState = signal('');

  form = this.fb.nonNullable.group({
    attending: [null as boolean | null, Validators.required],
    attendeeCount: [1, [Validators.required, Validators.min(1)]],
    message: ['', [Validators.maxLength(this.maxMessageLength)]],
  });

  protected attendeeOptions(): number[] {
    const max = this.invitee?.numberOfPeople ?? 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    if (this.invitee?.numberOfPeople) {
      this.form.patchValue({
        attendeeCount: Math.min(1, this.invitee.numberOfPeople),
      });
    }
  }

  protected setAttending(attending: boolean): void {
    this.form.patchValue({ attending });
    if (!attending) {
      this.form.patchValue({ attendeeCount: 0 });
    }
  }

  protected onSubmit(): void {
    if (!this.form.valid) return;
    
    const formValue = this.form.getRawValue();
    this.onRsvpSubmit.emit({
      attending: formValue.attending,
      attendeeCount: formValue.attending ? formValue.attendeeCount : 0,
      message: formValue.message,
    });
  }
}

