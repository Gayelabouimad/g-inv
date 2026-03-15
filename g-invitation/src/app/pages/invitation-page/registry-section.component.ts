import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-registry-section',
  standalone: true,
  template: `
    <section class="registry-section">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
      </div>

      <div class="registry-content">
        <p class="registry-text">{{ text }}</p>
        
        <div class="registry-card">
          <p class="registry-name">{{ name }}</p>
          <p class="registry-number">{{ accountNumber }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .registry-section {
      padding: 1.75rem 1.25rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 400;
      letter-spacing: 0.1em;
      margin: 0;
      font-family: 'Limelight', sans-serif;
      text-transform: uppercase;
    }

    .registry-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 500px;
      margin: 0 auto;
    }

    .registry-text {
      font-size: 0.95rem;
      text-align: center;
      margin: 0 0 1.5rem 0;
      line-height: 1.6;
      opacity: 0.9;
    }

    .registry-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 1.5rem 2rem;
      border-radius: 14px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .registry-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .registry-name {
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      margin: 0 0 0.5rem 0;
    }

    .registry-number {
      font-size: 1.3rem;
      font-weight: 400;
      letter-spacing: 0.05em;
      margin: 0;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .registry-section {
        padding: 1.5rem 1rem;
      }

      .section-title {
        font-size: 1.5rem;
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
}

