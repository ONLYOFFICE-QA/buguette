import { Component, OnInit } from '@angular/core';
import { BugzillaService, SearchParams, Severity, Status, Product, Priority } from '../services/bugzilla.service';
import { BugDetailService } from '../bug-details/bug-detail.service';
import { BehaviorSubject } from 'rxjs';
import { Bug } from '../models/bug';
import {ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  value: string;
  statuses: Status[];
  products: Product[];
  severities: Severity[];
  priorities: Priority[];
  bugs$: BehaviorSubject<Bug[]>;
  bugDetail$: BehaviorSubject<Bug>;
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

    this.products = this.bugzilla.products;
    this.severities = this.bugzilla.severities;

    // need for quick select in result list
    this.products.forEach(product => {
      this.productsColoreRestructured[product.realName] = product.color;
    });

    this.severities.forEach(severity => {
      this.severitiesRestructured[severity.realName] = severity;
    });
    this.statuses = this.bugzilla.statuses;
    this.priorities = this.bugzilla.priorities;
    this.bugs$.subscribe(_ => {
      this.loading = false;
    });
  }

  search(): void {
    const params: SearchParams = {};
    params.products = this.get_active_products();
    params.statuses = this.get_active_statuses();
    params.severities = this.get_active_severities();
    params.priorities = this.get_active_priorities();
    this.loading = true
    this.bugzilla.get_bugs(params);
  }

  get_details(bug: Bug): void {
    console.log(bug.id)
    this.bugDetail$.next(bug);
    this.router.navigate(['bug', bug.id], { relativeTo: this.route })
  }

  show() {
    return this.severityControl.value?.map((severity: Severity) => severity.realName)
  }

  get_active_products(): string[] {
    const activeProducts = this.products.filter(product => product.active);
    let result = [];
    if (activeProducts.length == 0) {
      result = this.products.map(product => product.realName);
    } else {
      result =  activeProducts.map(product => product.realName);
    }
    return result;
  }

  get_active_statuses(): string[] {
    return this.statuses.
    filter(status => status.active).
    map(status => [status.realName].concat(status.addition || [])).flat();
  }

  get_active_severities(): string[] {
    return this.severityControl.value?.map((severity: Severity) => severity.realName);
  }

  get_active_priorities(): string[] {
    return this.priorityControl.value?.map((priority: Priority) => priority.realName);
  }
}
