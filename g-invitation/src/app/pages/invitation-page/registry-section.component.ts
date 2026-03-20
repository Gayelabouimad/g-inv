import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registry-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="registry-section">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
      </div>

      <div class="registry-content">
        <p class="registry-text">{{ text }}</p>
        
        <div class="registry-card">
          <p class="registry-name">{{ name }}</p>
          <div class="account-number-container">
            <p class="registry-number">{{ accountNumber }}</p>
            <button
              type="button"
              class="copy-button"
              [title]="copiedState() ? 'Copied!' : 'Copy account number'"
              (click)="copyToClipboard()"
            >
              <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  focusable="false"
                  class="copy-icon"
                  role="img"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              >
                <path
                    d="M360 160L280 160C266.7 160 256 149.3 256 136C256 122.7 266.7 112 280 112L360 112C373.3 112 384 122.7 384 136C384 149.3 373.3 160 360 160zM360 208C397.1 208 427.6 180 431.6 144L448 144C456.8 144 464 151.2 464 160L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 160C176 151.2 183.2 144 192 144L208.4 144C212.4 180 242.9 208 280 208L360 208zM419.9 96C407 76.7 385 64 360 64L280 64C255 64 233 76.7 220.1 96L192 96C156.7 96 128 124.7 128 160L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 160C512 124.7 483.3 96 448 96L419.9 96z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .registry-section {
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
      margin: 0;
      line-height: 1.1;
      text-wrap: balance;
    }

    .registry-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
    }

    .registry-text {
      font-size: 0.95rem;
      text-align: center;
      margin: 0 0 1.5rem 0;
      line-height: 1.6;
      opacity: 0.9;
    }

    .registry-card {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04));
      border: 1px solid rgba(255, 255, 255, 0.17);
      padding: 1.5rem 2rem;
      border-radius: 16px;
      backdrop-filter: blur(9px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      text-align: center;
      transition: all 0.3s ease;
    }

    .registry-card:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .registry-name {
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
    }

    .registry-number {
      font-size: 1.3rem;
      font-weight: 400;
      letter-spacing: 0.05em;
      margin: 0;
      opacity: 0.8;
      flex: 1;
      text-align: center;
    }

    .account-number-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    .copy-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: inherit;
      flex-shrink: 0;
    }

    .copy-button:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .copy-button:active {
      transform: scale(0.95);
    }

    .copy-icon {
      width: 1.8rem;
      height: 1.8rem;
      opacity: 0.92;
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
      .registry-section {
        padding: 1rem;
      }

      .section-title {
        margin-bottom: 0.4rem;
      }

      .registry-text {
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }

      .registry-card {
        padding: 1.2rem 1.5rem;
      }

      .registry-name {
        font-size: 1rem;
      }

      .registry-number {
        font-size: 1.1rem;
      }
    }
  `]
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

