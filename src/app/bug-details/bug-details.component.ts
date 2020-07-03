import { Component, OnInit, getDebugNode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { Bug } from '../models/bug';
import { BugzillaService, StructuredUsers, AttachmentResponce } from '../services/bugzilla.service';
import { BugDetailService } from './bug-detail.service';
import { FileHelperService } from '../services/file-helper.service';
import { StaticData }  from '../static-data';
import { switchMap, map } from 'rxjs/operators';


@Component({
  selector: 'app-bug-details',
  templateUrl: './bug-details.component.html',
  styleUrls: ['./bug-details.component.scss']
})
export class BugDetailsComponent implements OnInit {
  bug$: ReplaySubject<Bug>;
  users$: ReplaySubject<StructuredUsers>;
  severitiesRestructured = {};
  productRestructured = {};
  folders = [];
  notes = [];
  severities = StaticData.SEVERITIES;
  products = StaticData.PRODUCTS;
  bugzillaLink: string = '';
  attachmentLoading = {};

  constructor(private activatedRoute: ActivatedRoute,
              private bugzilla: BugzillaService,
              private filehelper: FileHelperService,
              private bugDetailService: BugDetailService) { }

  ngOnInit(): void {
    this.bug$ = this.bugDetailService.bug$
    this.bug$.subscribe(bug => {
      this.bugzillaLink = StaticData.BUGZILLA_LINK + '/show_bug.cgi?id=' + bug.id;
    })

    this.users$ = this.bugzilla.users$

    this.activatedRoute.params.pipe(switchMap(params => {
      return this.bugzilla.get_bug_and_comments(params.id).pipe(map(bug => {
        if (bug.id.toString() === params.id) {
           this.bug$.next(bug);
        }
      }));
    })).subscribe();
  }
}
