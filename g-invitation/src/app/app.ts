import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { EVENT_CONFIG } from './data/event.data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle(`Wedding of ${EVENT_CONFIG.couple.primaryNames}`);
  }
}
