import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BugzillaService, Product } from '../services/bugzilla.service';
import { BookmarksService } from '../services/bookmarks.service';
import { SettingsService } from '../services/settings.service';
import { AuthGuardService } from '../guards/auth-guard.service';
import { switchMap, pluck, take, map } from 'rxjs/operators';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { StaticData } from '../static-data';
import { UntypedFormControl, Validators } from '@angular/forms';
import { SavedSearchObject } from '../models/user';
import { AboutComponent } from '../about/about.component'

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
    this.dialog.open(MainPageDialogSettingsComponent);
  }

  aboutOpen() {
    this.dialog.open(AboutComponent);
  }

  apply_search(bookmark) {
    this.bookmarksService.apply_search(bookmark);
  }
}

export interface SettingsDataInterface {
  currentTabIndex: number;
}

@Component({
  selector: 'app-main-page-dialog-settings',
  templateUrl: 'app-main-page-dialog-settings.html',
  styleUrls: ['app-main-page-dialog-settings.scss']
})
export class MainPageDialogSettingsComponent {
  products = Object.values(StaticData.PRODUCTS);
  bookmarkNewControl = new UntypedFormControl('', Validators.required);

  constructor(
    public dialogRef: MatDialogRef<MainPageDialogSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SettingsDataInterface,
    public settings: SettingsService,
    private activatedRoute: ActivatedRoute,
    public bugzillaService: BugzillaService,
    public bookmarkService: BookmarksService) {}


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

  keep_bookmark() {
    this.activatedRoute.queryParams.pipe(take(1), map(params => {
      let newBookmark: SavedSearchObject;
      newBookmark = {
        name: this.bookmarkNewControl.value,
        saved_search: params,
        fromBugzilla: false
      };
      this.bookmarkService.keep_to_bookmarks(newBookmark);
    })).subscribe();
  }

  delete_bookmark(bookmark: SavedSearchObject) {
    if (!bookmark.fromBugzilla) {
      this.bookmarkService.delete_bookmark(bookmark.name);
    }
  }
}
