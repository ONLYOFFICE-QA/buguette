import { Component, OnInit, getDebugNode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {BehaviorSubject, Observable, Subject, of, ReplaySubject} from 'rxjs';
import 'rxjs/add/operator/map';
import { switchMap, map } from 'rxjs/operators';
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

    // this.severities.forEach(severity => {
    //   this.severitiesRestructured[severity.realName] = severity;
    // });

    this.activatedRoute.params.switchMap(params => {
      return this.bugzilla.get_bug_by_id(params.id).map(bug => {
        if (bug.id.toString() === params.id) {
          this.bug$.next(bug);
        }
      });
    }).subscribe();
  }

  get_bug(id: number) {
    console.log('get_bug')
    return this.bugzilla.get_bug_by_id(id);
  }
}
