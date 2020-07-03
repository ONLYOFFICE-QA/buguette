import { Component, OnInit, Inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BugzillaService} from '../services/bugzilla.service';
import {SettingsService} from '../services/settings.service';
import { AuthGuardService } from '../guards/auth-guard.service';
import { switchMap, pluck } from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
     public bugzilla: BugzillaService,
     public auth: AuthGuardService,
     public dialog: MatDialog) { }

  ngOnInit(): void {

    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap( _ => {
        const userdata = JSON.parse(localStorage.getItem('user_data'));
        if (userdata.id) {
          return this.bugzilla.get_user({id: userdata.id});
        } else {
          return this.bugzilla.get_user({names: userdata.username});
        }
      })).subscribe();
  }

  logout() {
    this.bugzilla.logout();
  }

  settingsOpen() {
    const dialogRef = this.dialog.open(MainPageDialogSettings);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'app-main-page-dialog-settings',
  templateUrl: 'app-main-page-dialog-settings.html',
  styleUrls: ['app-main-page-dialog-settings.scss']
})
export class MainPageDialogSettings {

  constructor(public dialogRef: MatDialogRef<MainPageDialogSettings>, public settings: SettingsService,) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  comment_and_creator_change($event) {
    this.settings.comment_and_creator_change($event.checked);
  }

  autoload_images_change($event) {
    this.settings.autoload_images_change($event.checked);
  }
}
