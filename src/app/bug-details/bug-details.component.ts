import { Component, OnInit, getDebugNode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ReplaySubject} from 'rxjs';
import 'rxjs/add/operator/map';
import { Bug } from '../models/bug';
import { BugzillaService } from '../services/bugzilla.service';
import { BugDetailService } from './bug-detail.service';
import { StaticData }  from '../static-data';


@Component({
  selector: 'app-bug-details',
  templateUrl: './bug-details.component.html',
  styleUrls: ['./bug-details.component.scss']
})
export class BugDetailsComponent implements OnInit {
  bug$: ReplaySubject<Bug>;
  severitiesRestructured = {};
  productRestructured = {};
  folders = [];
  notes = [];
  severities = StaticData.SEVERITIES;
  products = StaticData.PRODUCTS;

  constructor(private activatedRoute: ActivatedRoute,
              private bugzilla: BugzillaService,
              private bugDetailService: BugDetailService) { }

  ngOnInit(): void {
    this.bug$ = this.bugDetailService.bug$

    this.activatedRoute.params.switchMap(params => {
      return this.bugzilla.get_bug_and_comments(params.id).map(bug => {
        if (bug.id.toString() === params.id) {
          this.bug$.next(bug);
        }
      });
    }).subscribe();
  }
}
