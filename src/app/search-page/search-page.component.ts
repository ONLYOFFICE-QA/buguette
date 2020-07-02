import { Component, OnInit } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority, StructuredUsers } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { ReplaySubject, Observable, Subject, BehaviorSubject } from 'rxjs';
import { Bug, UserDetail } from '../models/bug';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { StaticData } from '../static-data';
import { User } from '../models/user';
import { startWith, map, switchMap } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  statuses = StaticData.STATUSES;
  products = StaticData.PRODUCTS;
  severities = StaticData.SEVERITIES;
  priorities = StaticData.PRIORITIES;
  users$: Observable<StructuredUsers>;
  currentCount$: Observable<number> = new BehaviorSubject(0);
  currentCount: number;

  productsArray: Product[];
  severitiesArray: Severity[];
  prioritiesArray: Priority[];
  statusesArray: Status[];

  bugs$: ReplaySubject<Bug[]>;
  bugDetail$: ReplaySubject<Bug>;
  productsColoreRestructured = {};
  severitiesRestructured = {};
  loading = false;

  severityControl = new FormControl();
  priorityControl = new FormControl();
  createrControl = new FormControl();
  assignedToControl = new FormControl();
  quickFilterControl = new FormControl();

  filteredBugs: Observable<Bug[]>;
  filteredCreator: Observable<User[]>;
  filteredAssignedTo: Observable<User[]>;

  constructor(public bugzilla: BugzillaService,
    private router: Router,
    private route: ActivatedRoute,
    private bugDetail: BugDetailService,
    public settings: SettingsService) {
    this.filteredCreator = this.createrControl.valueChanges.pipe(startWith(''), switchMap(input => {
      return this.users$.pipe(map((structuredUsers: StructuredUsers) => {
        let users = Object.values(structuredUsers);
        return this.user_filtering(input, users)
      }));
    }));

    this.filteredAssignedTo = this.assignedToControl.valueChanges.pipe(startWith(''), switchMap(input => {
      return this.users$.pipe(map((structuredUsers: StructuredUsers) => {
        let users = Object.values(structuredUsers);
        return this.user_filtering(input, users)
      }));
    }));

    this.filteredBugs = this.quickFilterControl.valueChanges.pipe(startWith(''), switchMap(string => {
      return this.bugs$.pipe(map((bugs: Bug[]) => {
        return this.bugs_filtering(string, bugs)
      }));
    }));
  }

  private user_filtering(userInput: (string | undefined), users: User[]): User[] {
    return (typeof userInput == 'string') ? this._filterUsers(userInput, users) : users.slice()
  }

  private _filterUsers(value: string, users: User[]): User[] {
    const filterValue = value.toLowerCase();
    return users.filter(user => {
      const splittedName = user.real_name.toLowerCase().split(' ');
      let result = false;
      splittedName.forEach(word => {
        if (word.indexOf(filterValue) === 0) {
          result = true;
        }
      })
      if (!result) {
        result = user.real_name.toLowerCase().indexOf(filterValue) === 0
      }
      return result;
    });
  }

  private bugs_filtering(userInput: string, bugs: Bug[]) {
    let result = bugs
    if (userInput) {
      userInput = userInput?.toLowerCase();
      result = bugs.filter(bug => (bug.id + ' ' + bug.summary.toLowerCase()).indexOf(userInput) !== -1);
    }
    return result;
  }

  ngOnInit(): void {
    this.bugDetail$ = this.bugDetail.bug$;
    this.bugs$ = this.bugzilla.bugs$;
    this.users$ = this.bugzilla.users$
    // this.currentCount$.subscribe(x => {
    //   this.currentCount = x;
    //   return x
    // });

    this.productsArray = Object.values(this.products);
    this.severitiesArray = Object.values(this.severities);
    this.prioritiesArray = Object.values(this.priorities);
    this.statusesArray = Object.values(this.statuses);
  }

  displayUser(user: UserDetail): string {
    return user && user.real_name ? user.real_name : '';
  }

  search(): void {
    const params: SearchParams = {};
    params.products = this.get_active_products();
    params.statuses = this.get_active_statuses();
    params.severities = this.get_active_severities();
    params.priorities = this.get_active_priorities();
    params.creator = this.get_active_creater();
    params.assigned_to = this.get_active_assigned_to();
    params.quicksearch = this.quickFilterControl.value;
    params.creator_and_commentator = this.settings.settingsData$.getValue().comment_and_creator;
    this.loading = true
    this.bugzilla.get_bugs(params).subscribe(_ => {
      this.loading = false;
    });
  }

  get_details(bug: Bug): void {
    this.bugDetail$.next(bug);
    this.router.navigate(['bug', bug.id], { relativeTo: this.route });
  }

  get_active_products(): string[] {
    const activeProducts = this.productsArray.filter(product => product.active);
    let result = [];
    if (activeProducts.length == 0) {
      result = Object.keys(this.products);
    } else {
      result = activeProducts.map(product => product.realName);
    }
    return result;
  }

  get_active_statuses(): string[] {
    return this.statusesArray.
      filter(status => status.active).
      map(status => [status.realName].concat(status.addition || [])).flat();
  }

  get_active_severities(): string[] {
    return this.severityControl.value?.map((severity: Severity) => severity.realName);
  }

  get_active_priorities(): string[] {
    return this.priorityControl.value?.map((priority: Priority) => priority.realName);
  }

  get_active_creater(): string {
    return this.createrControl.value?.username;
  }

  get_active_assigned_to(): string {
    return this.assignedToControl.value?.username;
  }
}
