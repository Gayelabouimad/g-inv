import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="intro-section">
      <blockquote class="quote">
        <p class="quote-text">"{{ quote }}"</p>
        <footer class="quote-source">— {{ quoteSource }}</footer>
      </blockquote>

      <div class="family-request">
        <div class="families-section">
          @for (family of families; track family) {
            <p class="family-name">{{ family }}</p>
          }
        </div>

        <p class="intro-text">{{ introText }}</p>
      </div>

      <h1 class="couple-name">{{ coupleName }}</h1>


    </div>
  `,
  styles: [`
    .intro-section {
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4rem;
      height: 100%;
      font-family: "Varela Round", sans-serif;
      font-size: 1rem;
    }

    .quote {
      margin: 4rem 0 0 0;
    }

    .quote-text {
      font-size: 1.5rem;
      font-style: italic;
      font-family: 'Georgia', serif;
      line-height: 1.6;
      margin: 0 0 1rem 0;
      font-weight: 300;
    }

    .quote-source {
      font-size: 0.85rem;
      opacity: 0.7;
      font-style: normal;
      letter-spacing: 0.05em;
    }

    .family-request {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .families-section {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      justify-content: space-around;
    }

    .family-name {
      font-weight: 400;
      font-style: normal;
      letter-spacing: 0.05em;
      margin: 0;
      opacity: 0.9;
      max-width: 7rem;
    }

    .intro-text {
      font-weight: 300;
      line-height: 1.6;
      margin: 1rem 0 0 0;
      letter-spacing: 0.03em;
    }

    .couple-name {
      font-family: "Great Vibes", cursive;
      font-size: 3rem;
      font-weight: 300;
      letter-spacing: 0.05em;
      margin: 0;
      line-height: 1.2;
      max-width: 70%;
      animation: slideUp 0.8s ease-out 0.3s both;
      align-self: center;
    }

    @media (max-width: 768px) {
      .intro-section {
        padding: 2rem 1rem;
      }

    }
  `]
})
export class IntroSectionComponent {
  @Input() quote = '';
  @Input() quoteSource = '';
  @Input() families: string[] = [];
  @Input() introText = '';
  @Input() coupleName!: string;
}

