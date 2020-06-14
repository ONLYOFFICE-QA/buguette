import { Component, OnInit } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { ReplaySubject } from 'rxjs';
import { Bug, UserDetail } from '../models/bug';
import {ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import  { StaticData }  from '../static-data';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  value: string;
  usersWithAvatars: Array<string>;
  statuses = StaticData.STATUSES;
  products = StaticData.PRODUCTS;
  severities = StaticData.SEVERITIES;
  priorities = StaticData.PRIORITIES;
  users = StaticData.USERS;

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

  constructor(public bugzilla: BugzillaService, private router: Router,
              private route: ActivatedRoute, private bugDetail: BugDetailService, ) { }
  ngOnInit(): void {
    this.bugDetail$ = this.bugDetail.bug$;
    this.bugs$ = this.bugzilla.bugs$;

    this.productsArray = Object.values(this.products);
    this.severitiesArray = Object.values(this.severities);
    this.prioritiesArray = Object.values(this.priorities);
    this.statusesArray = Object.values(this.statuses);
    this.usersWithAvatars = this.users.filter(user => user.avatar).map(user => user.username);
  }

  search(): void {
    const params: SearchParams = {};
    params.products = this.get_active_products();
    params.statuses = this.get_active_statuses();
    params.severities = this.get_active_severities();
    params.priorities = this.get_active_priorities();
    this.loading = true
    this.bugzilla.get_bugs(params).subscribe(_ => {
      this.loading = false;
    });
  }

  get_details(bug: Bug): void {
    this.bugDetail$.next(bug);
    this.router.navigate(['bug', bug.id], { relativeTo: this.route });
  }

  show() {
    return this.severityControl.value?.map((severity: Severity) => severity.realName)
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

  get_image_name(details: UserDetail) {
    if (this.usersWithAvatars.includes(details.username)) {
      return 'url(/assets/avatars/' + details.username + '.jpg' + ')';
    }
    return 'url(/assets/avatars/default.jpg)';
  }
}
