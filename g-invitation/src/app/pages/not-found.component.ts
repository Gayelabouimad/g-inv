import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <h1>Page not found</h1>
      <a routerLink="/">Go to invitation home</a>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #111;
        color: #fff;
      }
      a {
        color: #d6c3a5;
      }
    `,
  ],
})
export class NotFoundComponent {}

