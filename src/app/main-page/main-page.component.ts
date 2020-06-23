import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BugzillaService} from '../services/bugzilla.service';
import { AuthGuardService } from '../guards/auth-guard.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, public bugzilla: BugzillaService,  public auth: AuthGuardService) { }

  ngOnInit(): void {

    this.activatedRoute.params.pluck('id').switchMap( _ => {
      const userdata = JSON.parse(localStorage.getItem('user_data'));
      if (userdata.id) {
        return this.bugzilla.get_user({id: userdata.id});
      } else {
        return this.bugzilla.get_user({names: userdata.username});
      }
    }).subscribe();
  }

  logout() {
    this.bugzilla.logout();
  }
}
