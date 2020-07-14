import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Observable } from 'rxjs';
import { Bug } from '../models/bug';
import { BugzillaService, StructuredUsers } from '../services/bugzilla.service';
import { BugDetailService } from './bug-detail.service';
import { StaticData }  from '../static-data';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';


@Component({
  selector: 'app-bug-details',
  templateUrl: './bug-details.component.html',
  styleUrls: ['./bug-details.component.scss']
})
export class BugDetailsComponent implements OnInit {
  bug$: Observable<Bug>;
  users$: ReplaySubject<StructuredUsers>;
  severitiesRestructured = {};
  productRestructured = {};
  folders = [];
  notes = [];
  severities = StaticData.SEVERITIES;
  products = StaticData.PRODUCTS;
  bugzillaLink: string = '';

  constructor(private activatedRoute: ActivatedRoute,
              private bugzilla: BugzillaService,
              private bugDetailService: BugDetailService,
              private settings: SettingsService) { }

  ngOnInit(): void {
    this.bug$ = this.bugDetailService.bug$.pipe(distinctUntilChanged((prev, curr) => {
      return (prev.id === curr.id) && curr.comments.length == 0
    }));
    this.bug$.subscribe(bug => {
      this.bugzillaLink = StaticData.BUGZILLA_LINK + '/show_bug.cgi?id=' + bug.id;
    })

    this.users$ = this.bugzilla.users$

    this.activatedRoute.params.pipe(switchMap(params => {
      return this.bugzilla.get_bug_and_comments(params.id).pipe(map(bug => {
        if (bug.id.toString() === params.id) {
          this.bugDetailService.bug$.next(bug);
        }
      }));
    })).subscribe();
  }

  get image_autoload() {
    return this.settings.settingsData$.getValue()?.autoload_images
  }
}
