import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BugzillaService, Product } from '../services/bugzilla.service';
import { BookmarksService } from '../services/bookmarks.service';
import { SettingsService } from '../services/settings.service';
import { AuthGuardService } from '../guards/auth-guard.service';
import { switchMap, pluck } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StaticData } from '../static-data';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute,
    public bookmarksService: BookmarksService,
    public bugzilla: BugzillaService,
    public auth: AuthGuardService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      pluck('id'),
      switchMap(_ => {
        const userdata = JSON.parse(localStorage.getItem('user_data'));
        if (userdata.id) {
          return this.bugzilla.get_user({ id: userdata.id });
        } else {
          return this.bugzilla.get_user({ names: userdata.username });
        }
      })).subscribe();
  }

  logout() {
    this.bugzilla.logout();
    window.navigator.credentials.preventSilentAccess();
  }

  settingsOpen() {
    const dialogRef = this.dialog.open(MainPageDialogSettings);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  apply_search(bookmark) {
    this.bookmarksService.apply_search(bookmark);
  }

  keep_bookmark() {
    this.bookmarksService.keep_to_bookmarks()
  }
}

@Component({
  selector: 'app-main-page-dialog-settings',
  templateUrl: 'app-main-page-dialog-settings.html',
  styleUrls: ['app-main-page-dialog-settings.scss']
})
export class MainPageDialogSettings {
  products = Object.values(StaticData.PRODUCTS);

  constructor(public dialogRef: MatDialogRef<MainPageDialogSettings>, public settings: SettingsService,) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  comment_and_creator_change($event) {
    this.settings.comment_and_creator_change($event.checked);
  }

  autoload_images_change($event) {
    this.settings.autoload_images_change($event.checked);
  }

  product_visibility_change(product: Product) {
    this.settings.product_visibility_change(product);
  }
}
