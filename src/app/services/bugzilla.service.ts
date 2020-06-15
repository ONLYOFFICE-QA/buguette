import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { Bug, BugResponceData } from '../models/bug';
import { CommentResponce, Comment } from '../models/comment';
import { User, UserResponceData } from '../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticData }  from '../static-data';

export interface UserData {
  id: number,
  token: string
  api_key?: string
}

export interface SearchParams {
  ids?: Array<number>,
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
  color: string;
  realName: string;
  isFeature?: boolean;
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

  bugs$: ReplaySubject<Bug[]> = new ReplaySubject(1);
  currentUser$: ReplaySubject<User> = new ReplaySubject(1);

  constructor(private httpService: HttpService, private router: Router) {  }

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

  get_bugs(searchParams: SearchParams): Observable<Bug[]> {
    let params = new HttpParams();

    searchParams.products?.forEach((product: string) => {
      params = params.append('product', product);
    });

    searchParams.statuses?.forEach((statusName: string) => {
      params = this.append_status(params, statusName);
    });


    searchParams.severities?.forEach((severity: string) => {
      params = params.append('severity', severity);
    });

    searchParams.priorities?.forEach((priority: string) => {
      params = params.append('priority', priority);
    });

    params = params.append('include_fields', 'status');
    params = params.append('include_fields', 'severity');
    params = params.append('include_fields', 'summary');
    params = params.append('include_fields', 'assigned_to');
    params = params.append('include_fields', 'qa_contact');
    params = params.append('include_fields', 'creator');
    params = params.append('include_fields', 'product');
    params = params.append('include_fields', 'priority');
    params = params.append('include_fields', 'id');

     return this.httpService.getRequest('/bug', params).map((response: {bugs: BugResponceData[]}) => {
       const _bugs = [];
       response.bugs.forEach(bug => {
         _bugs.push(new Bug(bug))
       });
         this.bugs$.next(_bugs.reverse());
         return _bugs;
     });
  }

  get_comments(bugId: number): Observable<any> {
    const url = '/bug/' + bugId + '/comment';
    return this.httpService.getRequest(url, new HttpParams()).map((response: {bugs: CommentResponce}) => {
      const comments = [];
      response.bugs[bugId].comments.forEach(commentData => {
        comments.push(new Comment(commentData));
      });
      return comments
    });
  }

  append_status(params: HttpParams, statusName: string) {
    switch(statusName) {
      case 'FIXED': {
        params = params.append('bug_status', 'RESOLVED');
        params = params.append('resolution', 'FIXED');
        break;
      }
      case 'VERIFIED': {
        params = params.append('bug_status', 'VERIFIED');
        params = params.append('resolution', 'FIXED');
        break;
      }
      default: {
         params = params.append('bug_status', statusName);
         break;
      }
   }
    return params;
  }

  get_bug_by_id(id: number): Observable<Bug> {
    let params = new HttpParams();
    params = params.append('id', id.toString());
    return this.httpService.getRequest('/bug', params).map((response: {bugs: BugResponceData[]}) => {
      const newBug = new Bug(response.bugs[0]);
      return new Bug(response.bugs[0]);
    });
  }

  get_bug_and_comments(id: number) {
    const bug = this.get_bug_by_id(id);
    const comments = this.get_comments(id);
    return Observable.forkJoin([bug, comments]).map(result => {
      const bug = result[0];
      bug.comments = result[1];
      result[0].comments = result[1];
      return bug;
    })
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

    if (userParams.apiKey) {
      params = params.append('api_key', userParams.apiKey);
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
