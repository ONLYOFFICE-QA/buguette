import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority, StructuredUsers, StructuredProducts, CustomSearch } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { ReplaySubject, Observable, merge, BehaviorSubject } from 'rxjs';
import { Bug, UserDetail } from '../models/bug';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl, AbstractControl, ValidationErrors, FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import { StaticData } from '../static-data';
import { User } from '../models/user';
import { startWith, map, switchMap, take } from 'rxjs/operators';
import { SettingsService, SettingsInterface } from '../services/settings.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { BookmarksService } from '../services/bookmarks.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MainPageDialogSettingsComponent } from '../main-page/main-page.component';

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
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
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

  priorityControl = new UntypedFormControl();
  createrControl = new UntypedFormControl({value: '', disabled: true});
  assignedToControl = new UntypedFormControl({value: '', disabled: true});
  quickFilterControl = new UntypedFormControl();
  versionControl = new UntypedFormControl();
  sortingControl = new UntypedFormControl();

  filteredBugs: Observable<Bug[]>;
  filteredCreator: Observable<User[]>;
  filteredAssignedTo: Observable<User[]>;
  filteredVersions: string[] = [];

  constructor(public bugzilla: BugzillaService,
              private router: Router,
              private bookmarksService: BookmarksService,
              private activatedRoute: ActivatedRoute,
              private cd: ChangeDetectorRef,
              private breakpointObserver: BreakpointObserver,
              private bugDetail: BugDetailService,
              public dialog: MatDialog,
              public settings: SettingsService) {
    this.filteredCreator = this.createrControl.valueChanges.pipe(startWith(''), switchMap(input => {
      return this.users$.pipe(switchMap((structuredUsers: StructuredUsers) => {
        return this.bugzilla.currentUser$.pipe(map(currentUser => {
          const users = Object.values(structuredUsers);
          return this.user_filtering(input, users, currentUser);
        }));
      }));
    }));

    this.filteredAssignedTo = this.assignedToControl.valueChanges.pipe(startWith(''), switchMap(input => {
      return this.users$.pipe(switchMap((structuredUsers: StructuredUsers) => {
        return this.bugzilla.currentUser$.pipe(map(currentUser => {
          const users = Object.values(structuredUsers);
          return this.user_filtering(input, users, currentUser);
        }));
      }));
    }));

    this.filteredBugs = merge(this.quickFilterControl.valueChanges, this.sortingControl.valueChanges).pipe(
      startWith(''),
      switchMap(_ => {
        return this.bugs$.pipe(map((bugs: Bug[]) => {
          this.currentCounts.all = bugs.length;
          const filteredBugs = this.bugs_filtering(this.quickFilterControl.value, bugs);
          this.currentCounts.hidden = this.currentCounts.all - filteredBugs.length;
          this.cd.detectChanges();
          return filteredBugs;
        }));
      }), map(bugs => this.bugs_sorting(bugs, this.sortingControl.value)));
  }

  private user_filtering(userInput: (string | undefined), users: User[], currentUser: User): User[] {
    if (typeof userInput === 'string') {
      return this._filterUsers(userInput, users, currentUser);
    } else {
      return this._get_allUsers_but_i_first(users, currentUser);
    }
  }

  private _get_allUsers_but_i_first(users: User[], currentUser: User): User[] {
    if (users.length === 0) { return users; }
    const currentUserIndex = users.map((user: User) => user.email).indexOf(currentUser.email);
    if (currentUserIndex > -1) {
      const currentUserWithAvatar = users.splice(currentUserIndex, 1);
      users.unshift(currentUserWithAvatar[0]);
    }
    return users;
  }

  private _filterUsers(value: string, users: User[], currentUser: User): User[] {
    const filterValue = value.toLowerCase();
    const filteredUsers = users.filter(user => {
      const splittedName = user.realName.toLowerCase().split(' ');
      let result = false;
      splittedName.forEach(word => {
        if (word.indexOf(filterValue) === 0) {
          result = true;
        }
      });
      if (!result) {
        result = user.realName.toLowerCase().indexOf(filterValue) === 0;
      }
      return result;
    });
    if (value.length === 0) {
      return this._get_allUsers_but_i_first(filteredUsers, currentUser);
    } else {
      return filteredUsers;
    }
  }

  private bugs_filtering(userInput: string, bugs: Bug[]) {
    let result = bugs;
    if (userInput) {
      userInput = userInput?.toLowerCase();
      result = bugs.filter(bug => (bug.id + ' ' + bug.summary.toLowerCase()).indexOf(userInput) !== -1);
    }
    return result;
  }

  ngOnInit(): void {
    this.bugDetail$ = this.bugDetail.bug$;
    this.bugs$ = this.bugzilla.bugs$;
    this.users$ = this.bugzilla.users$;
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
              return [...search.products].indexOf(this.products[hiddenProduct]?.id.toString()) === -1;
            });
          } else {
            hiddenProducts = settings.hidden_products;
          }
          let productIdsArray = search?.products;
          if (typeof productIdsArray === "string") {
            productIdsArray = [productIdsArray];
          }
          productIdsArray = productIdsArray?.map(value => +value);
          Object.values(this.products).forEach(product => {
            if (hiddenProducts?.indexOf(product.realName) === -1) {
              product.active = (productIdsArray?.indexOf(product.id) > -1);
              newProducts.push(product);
            }
          });
        } else {
          newProducts = Object.values(this.products);
        }
        this.productsArray$.next(newProducts);
      }));
    })).subscribe();

    this.bugzilla.currentUser$.pipe(take(1), map(() => {
      this.createrControl.enable();
      this.assignedToControl.enable();
    })).subscribe();

    this.activatedRoute.queryParams.pipe(take(1), switchMap((search: CustomSearch) => {
      return this.users$.pipe(map((users: StructuredUsers) => {
        return [search, users];
      }));
    })).subscribe((result: [CustomSearch, StructuredUsers]) => {
      this.preapply_filters(result[0], result[1]);
    });


    this.bookmarksService.currentBookmark$.pipe(switchMap(currentSearch => {
      return this.users$.pipe(map(users => {
        this.preapply_filters(currentSearch.saved_search, users);
        this.keep_current_search_to_query_force(currentSearch.saved_search);
      }));
    })).subscribe();

    this.sortingControl.valueChanges.subscribe(value => {
      if (value) {
        this.keep_current_search_to_query({ sorting_by_updated: value });
      } else {
        this.keep_current_search_to_query({ sorting_by_updated: null });
      }
    });

    this.priorityControl.valueChanges.subscribe(priorities => {
      if (priorities) {
        this.keep_current_search_to_query({ priorities: priorities.map(priority => priority.id) });
      }
    });

    this.quickFilterControl.valueChanges.subscribe(quickSearch => {
      if (quickSearch) {
        this.keep_current_search_to_query({ quick_search: quickSearch });
      } else {
        this.keep_current_search_to_query({ quick_search: null });
      }
    });

    this.versionControl.valueChanges.subscribe(versions => {
      if (versions) {
        this.keep_current_search_to_query({ versions });
      }
    });

    this.createrControl.valueChanges.subscribe(creator => {
      if (this.createrControl.value?.username) {
        this.keep_current_search_to_query({ creator: creator.username });
      } else {
        if (this.createrControl.value) {
          this.keep_current_search_to_query({ creator: this.createrControl.value });
        } else {
          this.keep_current_search_to_query({ creator: null });
        }
      }
    });

    this.assignedToControl.valueChanges.subscribe(assigner => {
      if (this.assignedToControl.value?.username) {
        this.keep_current_search_to_query({ assigned: assigner.username });
      } else {
        if (this.assignedToControl.value) {
          this.keep_current_search_to_query({ assigned: this.assignedToControl.value });
        } else {
          this.keep_current_search_to_query({ assigned: null });
        }
      }
    });

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
      this.productsArray$.next(this.get_active_objects(this.productsArray$, currentSearch.products));
    }
    if (currentSearch.sorting_by_updated) {
      this.sortingControl.setValue(true);
    }
    if (currentSearch.severities) {
      this.severitiesArray$.next(this.get_active_objects(this.severitiesArray$, currentSearch.severities));
    }
    if (currentSearch.statuses) {
      this.statusesArray$.next(this.get_active_objects(this.statusesArray$, currentSearch.statuses));
    }
    if (currentSearch.priorities) {
      this.priorityControl.setValue(
        this.prioritiesArray$.getValue().
          filter(currentPriority => currentSearch.priorities.indexOf(currentPriority.id) >= 0)
      );
    }
    if (currentSearch.versions) {
      let versions = currentSearch.versions;
      if (!Array.isArray(versions)) {
        versions = [versions];
      }
      this.versionControl.setValue(versions);
    }
    if (currentSearch.creator) {
      this.set_creater_control_value(currentSearch.creator, users);
    }
    if (currentSearch.assigned) {
      this.set_assined_to_control_value(currentSearch.assigned, users);
    }
    this.quickFilterControl.setValue(currentSearch.quick_search);
    const searchKeyses = Object.keys(currentSearch).filter(key => key !== 'sorting_by_updated');
    if (searchKeyses.length > 0) {
      this.search();
    }
  }

  set_creater_control_value(creator: (User | string), users): void {
    if (creator instanceof User) {
      this.createrControl.setValue(users[creator.username]);
    } else {
      const tmpUserName = Object.keys(users).find(user => user.toLowerCase() === creator.toLowerCase());
      if (tmpUserName) {
        this.createrControl.setValue(users[tmpUserName]);
      } else {
        let tempUser = new User({email: creator, real_name: creator})
        this.createrControl.setValue(tempUser);
      }
    }
  }

  set_assined_to_control_value(assignedTo: (User | string), users): void {
    if (assignedTo instanceof User) {
      this.assignedToControl.setValue(users[assignedTo.username]);
    } else {
      const tmpUserName = Object.keys(users).find(user => user.toLowerCase() === assignedTo.toLowerCase());
      if (tmpUserName) {
        this.assignedToControl.setValue(users[tmpUserName]);
      } else {
        let tempUser = new User({email: assignedTo, real_name: assignedTo})
        this.assignedToControl.setValue(tempUser);
      }
    }
  }

  get_active_objects(objects$, searchBy) {
    return objects$.getValue().map(obj => {
      let searchByArray:(string | number)[];;
      if (Array.isArray(searchBy)) {
        searchByArray = searchBy.map(x => +x);
      } else {
        searchByArray = [searchBy].map(x => +x);
      }
      obj.active = (searchByArray.indexOf(obj.id) >= 0);
      return obj;
    });
  }

  displayUser(user: UserDetail): string {
    return user && user.realName ? user.realName : '';
  }

  search(): void {
    const params: SearchParams = {};
    // ALL is need because by default, bugzilla will search only by opened bugs
    if (Number(this.quickFilterControl.value)) {
      params.quicksearch = 'bug_id:' + this.quickFilterControl.value;
    } else {
      params.products = this.get_active_products();
      params.statuses = this.get_active_statuses();
      params.severities = this.get_active_severities();
      params.priorities = this.get_active_priorities();
      params.creator = this.get_active_creater();
      params.assigned_to = this.get_active_assigned_to();
      params.versions = this.get_active_versions();
      params.quicksearch = this.escape_quick_search(this.quickFilterControl.value);
      params.creator_and_commentator = this.settings.settingsData$.getValue().comment_and_creator;
    }
    this.loading = true;
    this.bugzilla.get_bugs(params).subscribe(_ => {
      this.loading = false;
    });
  }

  /**
   * Escape search values for bugzilla
   *
   * @param {string | undefined} value - A string to cleanup
   * @return {string} Cleaned string
   *
   * @example
   *
   *     escape_quick_search('hello:world')
   */
  escape_quick_search(value: string | undefined): string {
    return value?.replace(':', '%3A');
  }

  get_details(bug: Bug): void {
    this.bugDetail$.next(bug);
    this.router.navigate(['bug', bug.id], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
  }

  get_active_products(): string[] {
    const activeProducts = this.productsArray$.getValue().
      filter(product => product.active);
    let result = [];
    if (activeProducts.length === 0) {
      result = Object.keys(this.products);
    } else {
      result = activeProducts.map(product => product.realName);
    }
    result = result.map(product => [product].concat(this.products[product]?.addition || [])).flat();
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
    let value: (User | string) = this.createrControl.value;
    if (value instanceof User)  {
      value = value.username;
    }
    return value;
  }

  get_active_assigned_to(): string {
    let value: (User | string) = this.assignedToControl.value;
    if (value instanceof User)  {
      value = value.username;
    }
    return value;
  }

  change_product_active(product: Product) {
    product.active = !product.active;
    const activeProducts = this.productsArray$.getValue().
      filter(currentProduct => currentProduct.active).map(currentProduct => currentProduct.id);
    this.filteredVersions = this.get_versions_list();
    this.keep_current_search_to_query({ products: activeProducts });
  }

  change_severity_active(severity: Severity) {
    severity.active = !severity.active;
    const activeSeverities = this.severitiesArray$.getValue().
      filter(currentSeverity => currentSeverity.active).map(currentSeverity => currentSeverity.id);
    this.keep_current_search_to_query({ severities: activeSeverities });
  }

  change_status_active(status: Status) {
    status.active = !status.active;
    const activeStatuses = this.statusesArray$.getValue().
      filter(currentStatus => currentStatus.active).map(currentStatus => currentStatus.id);
    this.keep_current_search_to_query({ statuses: activeStatuses });
  }

  get_versions_list() {
    let results: string[] = [];
    const activeProducts = this.get_active_products();
    const versions = this.bugzilla.versions$.getValue();
    const versionsInArrays: string[][] = activeProducts.map(productName => {
      return versions[productName]?.map(version => version.name);
    });
    results = [].concat(...versionsInArrays);
    const newVersionList = results.filter((version, index) => results.indexOf(version) === index).reverse();
    if (this.versionControl.value) {
      this.versionControl.setValue(newVersionList.filter(selected => this.versionControl.value.indexOf(selected) >= 0));
    }
    return results.filter((version, index) => results.indexOf(version) === index).reverse();
  }

  bugs_sorting(bugs: Bug[], byUpdated: boolean): Bug[] {
    if (byUpdated) {
      bugs = [...bugs.sort((a, b) => b.lastChangeTime.getTime() - a.lastChangeTime.getTime())];
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
    return !!value?.email;
  }

  sorting_control_toogle() {
    this.sortingControl.setValue(!this.sortingControl.value);
  }

  clear_filters() {
    this.priorityControl.reset();
    this.createrControl.reset();
    this.assignedToControl.reset();
    this.quickFilterControl.reset();
    this.versionControl.reset();
    this.clear_products_filtering();
    this.clear_statuses_filtering();
    this.clear_severity_filtering();
    this.keep_current_search_to_query_force({ sorting_by_updated: this.sortingControl.value });
  }

  clear_products_filtering() {
    const newProducts = this.productsArray$.getValue().map(product => {
      product.active = false;
      return product;
    });
    this.productsArray$.next(newProducts);
  }

  clear_statuses_filtering() {
    const newStatuses = this.statusesArray$.getValue().map(status => {
      status.active = false;
      return status;
    });
    this.statusesArray$.next(newStatuses);
  }

  clear_severity_filtering() {
    const newSeverities = this.severitiesArray$.getValue().map(severity => {
      severity.active = false;
      return severity;
    });
    this.severitiesArray$.next(newSeverities);
  }

  keep_bookmark(): void {
    this.dialog.open(MainPageDialogSettingsComponent, { data: { currentTabIndex: 2 } });
  }
}
