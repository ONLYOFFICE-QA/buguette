import { Component } from '@angular/core';
import { BugzillaService } from './services/bugzilla.service';
import { AuthGuardService } from './guards/auth-guard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Buguette';
  constructor(private bugzilla: BugzillaService, public auth: AuthGuardService) {}

  logout() {
    this.bugzilla.logout();
  }
}
