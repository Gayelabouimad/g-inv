import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thank-you-section',
  standalone: true,
  template: `
    <div class="thank-you-section">
      <div class="content">
        <div class="icon">✓</div>
        <h2>Thank You!</h2>
        <p class="message">Your response has been recorded.</p>
        
        <div class="response-summary">
          <div class="summary-item">
            <span class="label">Attending:</span>
            <span class="value">{{ attending ? 'Yes' : 'No' }}</span>
          </div>

          @if (attending && attendeeCount) {
            <div class="summary-item">
              <span class="label">Number of Guests:</span>
              <span class="value">{{ attendeeCount }}</span>
            </div>
          }

          @if (message) {
            <div class="summary-item">
              <span class="label">Your Message:</span>
              <span class="value message-text">{{ message }}</span>
            </div>
          }
        </div>

        <p class="closing">We look forward to celebrating with you!</p>
      </div>
    </div>
  `,
  styles: [`
    .thank-you-section {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 2rem 1rem;
      text-align: center;
    }

    .content {
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: checkmark 0.6s ease-out;
    }

    @keyframes checkmark {
      0% {
        opacity: 0;
        transform: scale(0.5) rotate(-180deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0);
      }
    }

    h2 {
      font-size: 2rem;
      font-weight: 300;
      letter-spacing: 0.05em;
      margin: 0 0 0.5rem 0;
      font-family: 'Georgia', serif;
    }

    .message {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0 0 2rem 0;
      letter-spacing: 0.03em;
    }

    .response-summary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      backdrop-filter: blur(10px);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0;
      font-size: 0.95rem;
    }

    .summary-item:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .label {
      opacity: 0.7;
      font-weight: 400;
    }

    .value {
      font-weight: 400;
    }

    .message-text {
      display: block;
      margin-top: 0.5rem;
      text-align: center;
      font-style: italic;
      opacity: 0.85;
      word-break: break-word;
    }

    .closing {
      font-size: 1rem;
      margin-top: 2rem;
      opacity: 0.8;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .thank-you-section {
        min-height: 50vh;
        padding: 1.5rem 1rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      .message {
        font-size: 0.95rem;
      }

      .summary-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;
      }

      .value {
        width: 100%;
      }
    }
  `]
})
export class ThankYouSectionComponent {
  @Input() attending = false;
  @Input() attendeeCount = 0;
  @Input() message = '';
}

