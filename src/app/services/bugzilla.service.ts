import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { Bug, BugResponceData } from '../models/bug';
import { User, UserResponceData } from '../models/user';
import { ActivatedRoute, Router } from '@angular/router';

export interface UserData {
  id: number,
  token: string
  api_key?: string
}

export interface SearchParams {
  products?: Array<string>,
  statuses?: Array<string>,
  severities?: Array<string>,
  priorities?: Array<string>,
}

export interface userParams {
  id?: string;
  names?: string;
  apiKey?: string;
  email?: string;
}

export interface Severity {
  name: string;
  realName: string;
  addition?: String[]
}

export interface Priority {
  name: string;
  realName: string;
  addition?: String[]
}

export interface Status {
  name: string;
  realName: string;
  active: boolean;
  addition?: Array<string>
}

export interface Product {
  name: string;
  color: string;
  active: boolean;
  realName: string;
}

@Injectable({
  providedIn: 'root'
})
export class BugzillaService {
  restructuredConstants = {products: {}};

  bugs$: BehaviorSubject<Bug[]> = new BehaviorSubject([]);
  currentUser$: ReplaySubject<User> = new ReplaySubject(1);
  products: Product[] = [{ name: "Documents", color: "#cbcbff", active: false, realName: "Office Canvas Document Editor" },
                         { name: "Spreadsheets", color: "#c5ffc5", active: false, realName: "Office Canvas Spreadsheet Editor" },
                         { name: "Presentations", color: "#ffa7a7", active: false, realName: "Office Canvas Presentation Editor" },
                         { name: "Plugins", color: "#ff8ee2", active: false, realName: "documenteditors plugins" },
                         { name: "Builder", color: "#feffba", active: false, realName: "DocumentBuilder" }];


  severities: Severity[] = [{ name: "Critical", realName: "critical", addition: ["blocker"] },
                            { name: "Major", realName: "major" },
                            { name: "Normal", realName: "normal" },
                            { name: "Minor", realName: "minor" },
                            { name: "Trivial", realName: "trivial" },
                            { name: "Enhancement", realName: "enhancement" }];

  statuses: Status[] = [{ name: "New/Assain", realName: "NEW", addition: ["ASSIGNED"], active: false},
                        { name: "Fixed", realName: "FIXED", active: false },
                        { name: "Verified", realName: "VERIFIED", active: false },
                        { name: "Reopen", realName: "REOPEN", active: false }];

  priorities: Priority[] = [{ name: "P1", realName: "P1"},
                        { name: "P2", realName: "P2"},
                        { name: "P3", realName: "P3"},
                        { name: "P4", realName: "P4"},
                        { name: "P5", realName: "P5"}];

  constructor(private httpService: HttpService, private router: Router) {
    this.products.forEach(product => {
      this.restructuredConstants.products[product.realName] = product;
    })
  }

  login(login: string, password: string): Observable<UserData> {
    let params = new HttpParams();
    params = params.append('login', login);
    params = params.append('password', password);
    return this.httpService.getRequest('/login', params);
  }

  logout(): void {
    const userdata = JSON.parse(localStorage.getItem('user_data'));
    if (userdata?.token) {
      let params = new HttpParams();
      this.httpService.getRequest('/logout', params);
    }
    localStorage.removeItem('user_data');
    this.currentUser$.next(undefined);
    this.router.navigate(['/login']);
  }

  get_bugs(searchParams: SearchParams) {
    let params = new HttpParams();

    searchParams.products?.forEach((product: string) => {
      params = params.append('product', product);
    });

    searchParams.statuses?.forEach((status: string) => {
      params = params.append('bug_status', status);
    });

    searchParams.severities?.forEach((severity: string) => {
      params = params.append('severity', severity);
    });

    searchParams.priorities?.forEach((priority: string) => {
      params = params.append('priority', priority);
    });

    params = params.append('include_fields', 'summary');
    params = params.append('include_fields', 'id');

     this.httpService.getRequest('/bug', params).subscribe((response: {bugs: BugResponceData[]}) => {
       const _bugs = [];
       response.bugs.forEach(bug => {
         _bugs.push(new Bug(bug))
       });
         this.bugs$.next(_bugs.reverse());
       console.log(response)
     });
  }

  get_bug_by_id(id: number) {
    return of(new Bug({
      'summary': id + 'Conversion failed при попытки открытия пределенный файлов xps',
      'id': id + '', 'status': 'New', 'product': 'DocumentServer Installation', 'importance': 'P1', 'assain': 'Rotatyy Dmitriy'
    }))
  }

  get_user_by_api(username: string, apiKey: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('api_key', apiKey);
    params = params.append('names', username);
    return this.httpService.getRequest('/user', params).map(res => {
      this.currentUser$.next(new User(res.users[0]));
    })
  }

  get_user(userParams: userParams) {
    let params = new HttpParams();
    if (userParams.id) {
      params = params.append('ids', userParams.id);
    }

    if (userParams.names) {
      params = params.append('names', userParams.names);
    }

    return this.httpService.getRequest('/user', params).map(res => {
      console.log(res.users[0]);
      this.currentUser$.next(new User(res.users[0]));
    })
  }

  handleError(error: any): string {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Login or password is incorrect`;
    }
    return errorMessage;
  }
}
