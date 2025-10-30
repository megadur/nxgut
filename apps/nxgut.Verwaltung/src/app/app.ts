import { Component } from '@angular/core';
import { APP_VERSION } from './version';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'nxgut.Verwaltung';
  protected appVersion = APP_VERSION;
}
