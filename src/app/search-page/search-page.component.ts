import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority, StructuredUsers } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { ReplaySubject, Observable, merge } from 'rxjs';
import { Bug, UserDetail } from '../models/bug';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { StaticData } from '../static-data';
import { User } from '../models/user';
import { startWith, map, switchMap } from 'rxjs/operators';
import { SettingsService, SettingsInterface } from '../services/settings.service';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';

export interface Counters {
  all?: number;
  hidden?: number;
}

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
  currentCounts: Counters = {};

  productsArray: Product[];
  severitiesArray: Severity[];
  prioritiesArray: Priority[];
  statusesArray: Status[];
  versionsArray: Status[];

  bugs$: ReplaySubject<Bug[]>;
  bugDetail$: ReplaySubject<Bug>;
  sorting_by_updated$: ReplaySubject<boolean> = new ReplaySubject(1);
  productsColoreRestructured = {};
  loading = false;
  severitySelected = {};
  smallForm = false;

  priorityControl = new FormControl();
  createrControl = new FormControl();
  assignedToControl = new FormControl();
  quickFilterControl = new FormControl();
  versionControl = new FormControl();
  sortingControl = new FormControl();

  filteredBugs: Observable<Bug[]>;
  filteredCreator: Observable<User[]>;
  filteredAssignedTo: Observable<User[]>;
  filteredVersions: String[] = [];

  constructor(public bugzilla: BugzillaService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
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

    this.filteredBugs = merge(this.quickFilterControl.valueChanges, this.sortingControl.valueChanges).pipe(
      startWith(''),
      switchMap(_ => {
      return this.bugs$.pipe(map((bugs: Bug[]) => {
        this.currentCounts.all = bugs.length;
        let _filteredBugs = this.bugs_filtering(this.quickFilterControl.value, bugs)
        this.currentCounts.hidden = this.currentCounts.all - _filteredBugs.length;
        this.cd.detectChanges();
        return _filteredBugs;
      }));
    }), map(bugs => this.bugs_sorting(bugs, this.sortingControl.value)));
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
    this.productsArray = Object.values(this.products);
    this.settings.settingsData$.pipe(map((settings: SettingsInterface) => {
      let newProducts = [];
      if (settings.hidden_products) {
        Object.values(this.products).forEach(product => {
          if (settings.hidden_products?.indexOf(product.realName) === -1) {
            product.active = this.productsArray.find(prod => prod.realName === product.realName)?.active;
            newProducts.push(product);
          }
        })
      this.productsArray = newProducts;
      }
    })).subscribe();
    this.sorting_by_updated$.next(this.get_sorting_from_storage());

    this.severitiesArray = Object.values(this.severities);
    this.prioritiesArray = Object.values(this.priorities);
    this.statusesArray = Object.values(this.statuses);
    this.filteredVersions = this.get_versions_list();
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
    ]).subscribe( (state: BreakpointState) => {
      if (state.breakpoints[Breakpoints.Medium] || state.breakpoints[Breakpoints.Small] || state.breakpoints[Breakpoints.XSmall]) {
           this.smallForm = true;
      } else {
        this.smallForm = false;
      }
    });
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
    params.versions = this.get_active_versions();
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
    return this.severitiesArray.
    filter((severity: Severity) => this.severitySelected[severity.name]).
    map((severity: Severity) => severity.realName);
  }

  get_active_versions(): string[] {
    return this.versionControl.value;
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

  change_product_active(product: Product) {
    product.active = !product.active;
    this.filteredVersions = this.get_versions_list();
  }

  get_versions_list() {
    let results: string[] = [];
    let active_products = this.get_active_products();
    const versions = this.bugzilla.versions$.getValue();
    const versionsInArrays: string[][] = active_products.map(productName => {
      return versions[productName].map(version => version.name);
    })
     results = [].concat(...versionsInArrays)
     const newVersionList = results.filter((version, index) => results.indexOf(version) == index).reverse();
     if (this.versionControl.value) {
      this.versionControl.setValue(newVersionList.filter(selected => this.versionControl.value.indexOf(selected) >= 0))
     }
     return results.filter((version, index) => results.indexOf(version) == index).reverse();
  }

  change_sorting(event$) {
    localStorage.setItem('sorting_by_updated', JSON.stringify({status: event$.checked}));
    this.sorting_by_updated$.next(event$.checked)
  }

  get_sorting_from_storage() {
    return (!!JSON.parse(localStorage.getItem('sorting_by_updated'))?.status)
  }

  bugs_sorting(bugs: Bug[], by_updated: boolean): Bug[] {
    if (by_updated) {
      bugs = [...bugs.sort((a, b) => b.last_change_time.getTime() - a.last_change_time.getTime())];
    } else {
      bugs = [...bugs.sort((a, b) =>  b.id - a.id)];
    }
    return bugs;
  }
}
