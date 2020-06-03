import { Component, OnInit, getDebugNode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {BehaviorSubject, Observable, Subject, of} from 'rxjs';
import 'rxjs/add/operator/map';
import { map, switchMap } from 'rxjs/operators';
import { Bug } from '../models/bug';
import { BugzillaService } from '../services/bugzilla.service';
import { BugDetailService } from './bug-detail.service';


@Component({
  selector: 'app-bug-details',
  templateUrl: './bug-details.component.html',
  styleUrls: ['./bug-details.component.scss']
})
export class BugDetailsComponent implements OnInit {
  bug$: BehaviorSubject<Bug>;

  constructor(private activatedRoute: ActivatedRoute,
              private bugzilla: BugzillaService,
              private bugDetailService: BugDetailService) { }

  ngOnInit(): void {
    this.bug$ = this.bugDetailService.bug$

    this.activatedRoute.params.pipe(switchMap(params => {
      return  this.bug$.pipe(switchMap(bug => {
        if (bug.isEmpty) {
          return this.get_bug(params.id);
        } else {
          return of(bug);
        }
      }))
    })).subscribe();
  }

  get_bug(id: number) {
    console.log('get_bug')
    return this.bugzilla.get_bug_by_id(id).map((bug: Bug) => {
      this.bugDetailService.bug$.next(bug);
    })
  }
}
