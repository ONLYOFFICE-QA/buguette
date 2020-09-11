import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Observable, BehaviorSubject, merge } from 'rxjs';
import { Bug } from '../models/bug';
import { BugzillaService, StructuredUsers, Severity, UpdateBugParams } from '../services/bugzilla.service';
import { BugDetailService } from './bug-detail.service';
import { StaticData } from '../static-data';
import { switchMap, map, distinctUntilChanged, take } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';
import { User } from '../models/user';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bug-details',
  templateUrl: './bug-details.component.html',
  styleUrls: ['./bug-details.component.scss']
})
export class BugDetailsComponent implements OnInit {
  bug$: Observable<Bug>;
  users$: ReplaySubject<StructuredUsers>;
  currentUser$: Observable<User>;
  loadingObserv: boolean = false;
  severitiesRestructured = {};
  bugStatusNext;
  productRestructured = {};
  severitiesArray$: BehaviorSubject<Severity[]>;
  severities = StaticData.SEVERITIES;
  statuses = StaticData.STATUSES;
  products = StaticData.PRODUCTS;
  bugzillaLink: string;
  sendCommentDisable = true;
  newCommentLoading = false;
  progress = {mode: 'buffer', value: 0};

  newCommentFormGroup = new FormGroup({
    newSeverityControl: new FormControl(),
    newStatusControl: new FormControl({ value: '', disabled: true }),
    newCommentControl: new FormControl(''),
  })

  constructor(private activatedRoute: ActivatedRoute,
    private bugzilla: BugzillaService,
    private bugDetailService: BugDetailService,
    private settings: SettingsService) {

    this.currentUser$ = this.bugzilla.users$.pipe(take(1), switchMap(users => {
      return this.bugzilla.currentUser$.pipe(map(user => {
        return users[user.username]
      }))
    }));
  }

  ngOnInit(): void {
    this.severitiesArray$ = new BehaviorSubject(Object.values(this.severities));

    this.bug$ = this.bugDetailService.bug$.pipe(distinctUntilChanged((prev, curr) => {
      return (prev.id === curr.id) && curr.comments.length === 0;
    }));
    this.bug$.subscribe(bug => {
      this.bugzillaLink = StaticData.BUGZILLA_LINK + '/show_bug.cgi?id=' + bug.id;
      this.set_bug_status_change_variants(bug);

      this.newCommentFormGroup.controls.newSeverityControl.setValue(this.get_severity_by_name(bug.severity).realName);
    });

    this.users$ = this.bugzilla.users$;

    this.activatedRoute.params.pipe(switchMap(params => {
      this.loadingObserv = true;
      return this.bugzilla.get_bug_and_comments(params.id).pipe(map(bug => {
        this.loadingObserv = false;
        if (bug.id.toString() === params.id) {
          this.bugDetailService.bug$.next(bug);
        }
      }));
    })).subscribe();

    this.newCommentFormGroup.valueChanges.pipe(switchMap(result => {
      return this.bug$.pipe(map(bug => {
        const severityСheck: boolean = this.severity_check(bug.severity, result.newSeverityControl);
        const statusCheck: boolean = this.status_check(bug.status, result.newStatusControl);
        const commentCheck: boolean = result.newCommentControl?.length > 0;
        this.sendCommentDisable = !((severityСheck && statusCheck) || commentCheck);
      }));
    })).subscribe();
  }

  log() {
    console.log('asdasd')
  }

  set_bug_status_change_variants(bug: Bug): void {
    this.bugStatusNext = this.get_bug_status_next(bug);
    if (this.statuses[this.bugStatusNext].nextStatus.length > 0) {
      this.newCommentFormGroup.controls.newStatusControl.enable();
    }
    this.newCommentFormGroup.controls.newStatusControl.setValue(this.bugStatusNext);
  }

  get_bug_status_next(bug: Bug) {
    return Object.values(this.statuses).filter(value => {
      return [value.realName].concat(value?.addition).indexOf(bug.buguetteStatus) > -1;
    })[0].realName;
  }

  severity_check(bugSeverity, formSeverity): boolean {
    const severityObject = this.get_severity_by_name(bugSeverity);

    return [severityObject.realName].concat(severityObject.addition).indexOf(formSeverity) > -1;
  }

  get_severity_by_name(name) {
    return Object.values(this.severities).find(severityObject => {
      return [severityObject.realName].concat(severityObject.addition).indexOf(name) > -1
    })
  }

  status_check(bugStatus, formStatus): boolean {
    const statusObject = Object.values(this.statuses).find(statusObject => {
      return [statusObject.realName].concat(statusObject.addition).indexOf(bugStatus) > -1
    })
    return [statusObject.realName].concat(statusObject.addition).indexOf(formStatus) > -1;
  }

  get image_autoload() {
    return this.settings.settingsData$.getValue()?.autoload_images;
  }

  update_bug(bug: Bug) {
    this.progress.value = 0;
    this.progress.mode = 'buffer';

    this.newCommentLoading = true;
    this.sendCommentDisable = true;

    this.bugzilla.create_comment(bug.id, this.newCommentFormGroup.controls.newCommentControl.value).pipe(switchMap(comment => {
      this.progress.mode = 'determinate';
      return this.bug$.pipe(take(1), map(bug => {
        bug.comments.push(comment);
        this.newCommentFormGroup.controls.newCommentControl.reset();
        this.newCommentLoading = false;
        this.progress.value += 50;
      }))
    })).subscribe()

    let updateBugData = this.get_updateBugData(bug);
    if (updateBugData.severity || updateBugData.status || updateBugData.resolution) {
      this.update_bug_data(bug)
    } else {
      this.progress.mode = 'determinate';
      this.progress.value += 50;
    }
  }

  update_bug_data(bug: Bug): void {
    this.bugzilla.update_bug(bug.id, this.get_updateBugData(bug)).pipe(switchMap(res => {
      this.progress.mode = 'determinate';
      return this.bug$.pipe(take(1), map(bug => {
        console.log(res);
        bug.set_lastChangeTime(res.last_change_time);
        if (res.changes.severity) {
          bug.set_severity(res.changes.severity.added);
        }
        if (res.changes.status) {
          bug.set_status(res.changes.status.added);
        }
        if (res.changes.resolution) {
          bug.set_resolution(res.changes.resolution.added);
        }
        this.set_bug_status_change_variants(bug);
        this.progress.value += 50;
      }))

    })).subscribe();
  }

  get_updateBugData(bug): UpdateBugParams {
    const updateBugData: UpdateBugParams = {};
    const newSeverityControlValue = this.newCommentFormGroup.controls.newSeverityControl.value
    const severityСheck: boolean = this.severity_check(bug.severity, newSeverityControlValue);
    if (!severityСheck) {
       updateBugData.severity = this.severities[newSeverityControlValue].realName;
    }
    const newStatusControlValue = this.newCommentFormGroup.controls.newStatusControl.value;
    const statusСheck: boolean = this.status_check(bug.status, newStatusControlValue);

    if (!statusСheck) {
      const statusRealName = this.statuses[newStatusControlValue]?.realName
      if (statusRealName) {
        updateBugData.status = statusRealName;
      } else {
        updateBugData.status = 'RESOLVED';
        updateBugData.resolution = newStatusControlValue;
      }
    }
    return updateBugData;
  }
}
