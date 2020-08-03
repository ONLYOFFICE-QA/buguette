import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority, StructuredUsers, StructuredProducts } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { CustomSearch } from '../services/search-keeper.service';
import { ReplaySubject, Observable, merge, BehaviorSubject } from 'rxjs';
import { Bug, UserDetail } from '../models/bug';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, AbstractControl, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms';
import { StaticData } from '../static-data';
import { User } from '../models/user';
import { startWith, map, switchMap, take } from 'rxjs/operators';
import { SettingsService, SettingsInterface } from '../services/settings.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { BookmarksService } from '../services/bookmarks.service';
import { ErrorStateMatcher } from '@angular/material/core';

export interface Counters {
  all?: number;
  hidden?: number;
}

export class UserRegistrationFormValidators {
  static userShouldBeSelected(control: AbstractControl): ValidationErrors | null {
      if (control.value instanceof User || control.value == null) {
          return null;
      }
      // If there is no validation failure, return null
      return { shouldBeSelected: true };
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return control?.value && control?.invalid;
  }
}

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  matcher = new MyErrorStateMatcher();


  statuses = StaticData.STATUSES;
  products: StructuredProducts = StaticData.PRODUCTS;
  severities = StaticData.SEVERITIES;
  priorities = StaticData.PRIORITIES;
  users$: Observable<StructuredUsers>;
  currentCounts: Counters = {};

  productsArray$: BehaviorSubject<Product[]>;
  severitiesArray$: BehaviorSubject<Severity[]>;
  statusesArray$: BehaviorSubject<Status[]>;
  prioritiesArray$: BehaviorSubject<Priority[]>;
  versionsArray: Status[];

  bugs$: ReplaySubject<Bug[]>;
  bugDetail$: ReplaySubject<Bug>;
  productsColoreRestructured = {};
  loading = false;
  severitySelected = {};
  smallForm = false;

  priorityControl = new FormControl();
  createrControl = new FormControl('', [UserRegistrationFormValidators.userShouldBeSelected]);
  assignedToControl = new FormControl('', [UserRegistrationFormValidators.userShouldBeSelected]);
  quickFilterControl = new FormControl();
  versionControl = new FormControl();
  sortingControl = new FormControl();

  filteredBugs: Observable<Bug[]>;
  filteredCreator: Observable<User[]>;
  filteredAssignedTo: Observable<User[]>;
  filteredVersions: String[] = [];

  constructor(public bugzilla: BugzillaService,
    private router: Router,
    private bookmarksService: BookmarksService,
    private activatedRoute: ActivatedRoute,
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
    this.productsArray$ = new BehaviorSubject(Object.values(this.products));
    this.severitiesArray$ = new BehaviorSubject(Object.values(this.severities));
    this.statusesArray$ = new BehaviorSubject(Object.values(this.statuses));
    this.prioritiesArray$ = new BehaviorSubject(Object.values(this.priorities));

    this.settings.settingsData$.pipe(switchMap((settings: SettingsInterface) => {
      return this.activatedRoute.queryParams.pipe(map(search => {
        let newProducts = [];
        let hiddenProducts = [];
        if (settings.hidden_products) {
          if (search.products) {
            hiddenProducts = settings.hidden_products.filter(hiddenProduct => {
              return [...search.products].indexOf(this.products[hiddenProduct].id.toString()) == -1
            })
          } else {
            hiddenProducts = settings.hidden_products;
          }
          Object.values(this.products).forEach(product => {
            if (hiddenProducts?.indexOf(product.realName) === -1) {
              product.active = (search?.products?.indexOf(product.id.toString()) > -1);
              newProducts.push(product);
            }
          })
        } else {
          newProducts = Object.values(this.products);
        }
        this.productsArray$.next(newProducts);
      }));
    })).subscribe();

    this.activatedRoute.queryParams.pipe(take(1), switchMap((search: CustomSearch) => {
      return this.users$.pipe(map((users: StructuredUsers) => {
        return [search, users];
      }))
    })).subscribe((result: [CustomSearch, StructuredUsers]) => {
      this.preapply_filters(result[0], result[1]);
    });


    this.bookmarksService.currentBookmark$.pipe(switchMap(currentSearch => {
      return this.users$.pipe(map(users => {
        this.preapply_filters(currentSearch.saved_search, users);
        this.keep_current_search_to_query_force(currentSearch.saved_search);
      }))
    })).subscribe()

    this.sortingControl.valueChanges.subscribe(value => {
      if (value) {
        this.keep_current_search_to_query({ sorting_by_updated: value })
      } else {
        this.keep_current_search_to_query({ sorting_by_updated: null })
      }
    })

    this.priorityControl.valueChanges.subscribe(priorities => {
      if (priorities) {
        this.keep_current_search_to_query({ priorities: priorities.map(priority => priority.id) })
      }
    })

    this.quickFilterControl.valueChanges.subscribe(quick_search => {
      if (quick_search) {
        this.keep_current_search_to_query({ quick_search: quick_search })
      } else {
        this.keep_current_search_to_query({ quick_search: null })
      }
    })

    this.versionControl.valueChanges.subscribe(versions => {
      if (versions) {
        this.keep_current_search_to_query({ versions })
      }
    })

    this.createrControl.valueChanges.subscribe(creator => {
      if (this.createrControl.value?.username) {
        this.keep_current_search_to_query({ creator: creator.username })
      } else {
        this.keep_current_search_to_query({ creator: null })
      }
    })

    this.assignedToControl.valueChanges.subscribe(assigner => {
      if (this.assignedToControl.value?.username) {
        this.keep_current_search_to_query({ assigned: assigner.username })
      } else {
        this.keep_current_search_to_query({ assigned: null })
      }
    })

    this.filteredVersions = this.get_versions_list();
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
    ]).subscribe((state: BreakpointState) => {
      if (state.breakpoints[Breakpoints.Medium] || state.breakpoints[Breakpoints.Small] || state.breakpoints[Breakpoints.XSmall]) {
        this.smallForm = true;
      } else {
        this.smallForm = false;
      }
    });
  }

  preapply_filters(currentSearch: CustomSearch, users: StructuredUsers) {
    if (currentSearch.products) {
      this.productsArray$.next(this.get_active_objects(this.productsArray$, currentSearch.products))
    }
    if (currentSearch.sorting_by_updated) {
      this.sortingControl.setValue(true);
    }
    if (currentSearch.severities) {
      this.severitiesArray$.next(this.get_active_objects(this.severitiesArray$, currentSearch.severities))
    }
    if (currentSearch.statuses) {
      this.statusesArray$.next(this.get_active_objects(this.statusesArray$, currentSearch.statuses))
    }
    if (currentSearch.priorities) {
      this.priorityControl.setValue(
        this.prioritiesArray$.getValue().
        filter(currentPriority => currentSearch.priorities.indexOf(currentPriority.id) >= 0)
        );
    }
    if (currentSearch.versions) {
      let _versions = currentSearch.versions
      if (!Array.isArray(_versions)) {
        _versions = [_versions]
      }
      this.versionControl.setValue(_versions);
    }
    if (currentSearch.creator) {
      this.createrControl.setValue(users[currentSearch.creator]);
    }
    if (currentSearch.assigned) {
      this.assignedToControl.setValue(users[currentSearch.assigned]);
    }
    if (currentSearch.quick_search) {
      this.quickFilterControl.setValue(currentSearch.quick_search);
    }
    let searchKeyses = Object.keys(currentSearch).filter(key => key !== 'sorting_by_updated');
    if (searchKeyses.length > 0 ) {
      // this.search();
    }
  }

  get_active_objects(objects$, searchBy: number[]) {
    return objects$.getValue().map(obj => {
      obj.active = (searchBy.indexOf(obj.id) >= 0)
      return obj;
    })
  }

  displayUser(user: UserDetail): string {
    return user && user.real_name ? user.real_name : '';
  }

  search(): void {
    const params: SearchParams = {};
    // ALL is need because by default, bugzilla will search only by opened bugs
    if (Number(this.quickFilterControl.value)) {
      params.quicksearch = "bug_id:" + this.quickFilterControl.value;
    } else {
      params.products = this.get_active_products();
      params.statuses = this.get_active_statuses();
      params.severities = this.get_active_severities();
      params.priorities = this.get_active_priorities();
      params.creator = this.get_active_creater();
      params.assigned_to = this.get_active_assigned_to();
      params.versions = this.get_active_versions();
      params.quicksearch = this.quickFilterControl.value;
      params.creator_and_commentator = this.settings.settingsData$.getValue().comment_and_creator;
    }
    this.loading = true
    this.bugzilla.get_bugs(params).subscribe(_ => {
      this.loading = false;
    });
  }

  get_details(bug: Bug): void {
    this.bugDetail$.next(bug);
    this.router.navigate(['bug', bug.id], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
  }

  get_active_products(): string[] {
    const activeProducts = this.productsArray$.getValue().
      filter(product => product.active);
    let result = [];
    if (activeProducts.length == 0) {
      result = Object.keys(this.products);
    } else {
      result = activeProducts.map(product => product.realName);
    }
    result = result.map(product => [product].concat(this.products[product].addition || [])).flat()
    return result;
  }

  get_active_statuses(): string[] {
    return this.statusesArray$.getValue().
      filter(status => status.active).
      map(status => [status.realName].concat(status.addition || [])).flat();
  }

  get_active_severities(): string[] {
    return this.severitiesArray$.getValue().
      filter((severity: Severity) => severity.active).
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
    let activeProducts = this.productsArray$.getValue().
      filter(product => product.active).map(product => product.id);
    this.filteredVersions = this.get_versions_list();
    this.keep_current_search_to_query({ products: activeProducts });
  }

  change_severity_active(severity: Severity) {
    severity.active = !severity.active;
    let activeSeverities = this.severitiesArray$.getValue().
      filter(currentSeverity => currentSeverity.active).map(currentSeverity => currentSeverity.id);
    this.keep_current_search_to_query({ severities: activeSeverities });
  }

  change_status_active(status: Status) {
    status.active = !status.active;
    let activeStatuses = this.statusesArray$.getValue().
      filter(currentStatus => currentStatus.active).map(currentStatus => currentStatus.id);
    this.keep_current_search_to_query({ statuses: activeStatuses });
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

  bugs_sorting(bugs: Bug[], by_updated: boolean): Bug[] {
    if (by_updated) {
      bugs = [...bugs.sort((a, b) => b.last_change_time.getTime() - a.last_change_time.getTime())];
    } else {
      bugs = [...bugs.sort((a, b) => b.id - a.id)];
    }
    return bugs;
  }

  keep_current_search_to_query(params: CustomSearch) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  keep_current_search_to_query_force(params: CustomSearch) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
    });
  }

  is_user(value) {
    return !!value?.email
  }

  sorting_control_toogle() {
    this.sortingControl.setValue(!this.sortingControl.value)
  }

  clear_filters() {
    this.priorityControl.reset()
    this.createrControl.reset()
    this.assignedToControl.reset()
    this.quickFilterControl.reset()
    this.versionControl.reset()
    this.clear_products_filtering();
    this.clear_statuses_filtering();
    this.clear_severity_filtering();
    this.keep_current_search_to_query_force({ sorting_by_updated: this.sortingControl.value })
  }

  clear_products_filtering() {
    let _newProducts = this.productsArray$.getValue().map(product => {
      product.active = false
      return product;
    });
    this.productsArray$.next(_newProducts);
  }

  clear_statuses_filtering() {
    let _newStatuses = this.statusesArray$.getValue().map(status => {
      status.active = false
      return status;
    });
    this.statusesArray$.next(_newStatuses);
  }

  clear_severity_filtering() {
    let _newSeverities = this.severitiesArray$.getValue().map(severity => {
      severity.active = false
      return severity;
    });
    this.severitiesArray$.next(_newSeverities);
  }

  keep_bookmark() {
    console.log('keep_bookmarkkeep_bookmarkkeep_bookmark')
  }
}
