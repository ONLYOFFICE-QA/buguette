import { Injectable } from '@angular/core';
import { HttpService } from './http-request.service';
import { HttpParams } from '@angular/common/http';
import { Bug, BugResponceData } from '../models/bug';
import { CommentResponce, Comment, CommentResponceData } from '../models/comment';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { StaticData } from '../static-data';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

export interface UserData {
  id: number;
  token: string;
  api_key?: string;
}

export interface StructuredUsers {
  [key: string]: User;
}

export interface StructuredProducts {
  [key: string]: Product;
}

export interface SearchParams {
  ids?: Array<number>;
  products?: Array<string>;
  statuses?: Array<string>;
  severities?: Array<string>;
  priorities?: Array<string>;
  versions?: Array<string>;
  creator?: string;
  assigned_to?: string;
  quicksearch?: string;
  creator_and_commentator?: boolean;
}

export interface UserParams {
  id?: string;
  names?: string;
  apiKey?: string;
  email?: string;
}

export interface UpdateBugParams {
  status?: string;
  resolution?: string;
  severity?: string;
}

export interface Severity {
  id: number;
  name: string;
  color: string;
  realName: string;
  isFeature?: boolean;
  addition?: string[];
  active?: boolean;
}

export interface Priority {
  id: number;
  name: string;
  realName: string;
  addition?: string[];
}

export interface Status {
  id: number;
  name: string;
  realName: string;
  active: boolean;
  addition?: Array<string>;
}

export interface Product {
  id: number;
  name: string;
  color: string;
  active: boolean;
  realName: string;
  addition?: string[];
}

export interface AttachmentResponceObject {
  id: string;
  big_id: number;
  content_type: string;
  creation_time: string;
  creator: string;
  data: string;
  file_name: string;
  last_change_time: string;
  size: number;
  summary: string;
  is_obsolete: (0|1);
}

export interface AttachmentResponce {
  bugs: {
    [key: number]: AttachmentResponceObject[]
  };
  attachments: {
    [key: number]: AttachmentResponceObject
  };
}

export interface StructuredProductVersions {
  [key: string]: VersionInterface[];
}

export interface ProductResponce {
  products: {name: string, versions: VersionInterface[]}[];
}

export interface VersionInterface {
  id: number;
  is_active: boolean;
  name: string;
  sort_key: number;
}

export interface CustomSearch {
  products?: number[];
  severities?: number[];
  statuses?: number[];
  priorities?: number[];
  versions?: string[];
  creator?: string;
  assigned?: string;
  quick_search?: string;
  sorting_by_updated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BugzillaService {
  restructuredConstants = {products: {}};

  bugs$: ReplaySubject<Bug[]> = new ReplaySubject(1);
  users$: ReplaySubject<StructuredUsers> = new ReplaySubject(1);
  currentUser$: ReplaySubject<User> = new ReplaySubject(1);
  versions$: BehaviorSubject<StructuredProductVersions> = new BehaviorSubject({});

  constructor(private httpService: HttpService, private router: Router, private sanitizer: DomSanitizer) {  }

  login(login: string, password: string): Observable<UserData> {
    let params = new HttpParams();
    params = params.append('login', login);
    params = params.append('password', password);
    return this.httpService.getRequest('/login', params);
  }

  logout(): void {
    const userdata = JSON.parse(localStorage.getItem('user_data'));
    if (userdata?.token) {
      const params = new HttpParams();
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

    searchParams.versions?.forEach((version: string) => {
      params = params.append('version', version);
    });

    if (searchParams.assigned_to) {
      params = params.append('assigned_to', searchParams.assigned_to);
    }

    if (searchParams.quicksearch) {
      params = params.append('quicksearch',  'ALL ' + searchParams.quicksearch);
    }
    params = params.append('include_fields', 'status');
    params = params.append('include_fields', 'resolution');
    params = params.append('include_fields', 'severity');
    params = params.append('include_fields', 'summary');
    params = params.append('include_fields', 'assigned_to');
    params = params.append('include_fields', 'qa_contact');
    params = params.append('include_fields', 'creator');
    params = params.append('include_fields', 'product');
    params = params.append('include_fields', 'priority');
    params = params.append('include_fields', 'id');
    params = params.append('include_fields', 'last_change_time');

    return this.users$.pipe(switchMap(users => {
      if (searchParams.creator_and_commentator && searchParams.creator) {
        params = params.append('email1', users[searchParams.creator].email);
        params = params.append('emaillongdesc1', '1');
      } else if (searchParams.creator) {
        params = params.append('creator', searchParams.creator);
      }
      return this.httpService.getRequest('/bug', params).pipe(map((response: {bugs: BugResponceData[]}) => {
        const bugs = [];
        response.bugs.forEach(bug => {
          bugs.push(new Bug(bug));
        });
        this.bugs$.next(bugs.reverse());
        return bugs;
      }));
    }));
  }

  get_comments(bugId: number): Observable<any> {
    const url = '/bug/' + bugId + '/comment';
    return this.httpService.getRequest(url, new HttpParams()).pipe(map((response: {bugs: CommentResponce}) => {
      const comments = [];
      response.bugs[bugId].comments.forEach(commentData => {
        comments.push(new Comment(commentData));
      });
      return comments;
    }));
  }

  get_comment_by_id(commentId: number): Observable<Comment> {
    const url = '/bug/comment/' + commentId;
    return this.httpService.getRequest(url, new HttpParams()).pipe(map((response: {comments: CommentResponceData}) => {
      return new Comment(response.comments[commentId]);
    }));
  }

  get_attachments(bugId: number): Observable<AttachmentResponce> {
    const url = '/bug/' + bugId + '/attachment';
    return this.httpService.getRequest(url, new HttpParams());
  }

  get_attachment(id: number): Observable<AttachmentResponce> {
    const url = '/bug/attachment/' + id;
    return this.httpService.getRequest(url, new HttpParams());
  }

  append_status(params: HttpParams, statusName: string): HttpParams {
    switch (statusName) {
      case 'NEW': {
        params = params.append('bug_status', 'NEW');
        // params = params.append('resolution', '---');
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
    return this.httpService.getRequest('/bug', params).pipe(map((response: {bugs: BugResponceData[]}) => {
      const newBug = new Bug(response.bugs[0]);
      return new Bug(response.bugs[0]);
    }));
  }

  get_bug_and_comments(id: number): Observable<Bug> {
    const comments = this.get_comments(id);
    return forkJoin([this.get_bug_by_id(id), comments]).pipe(map(result => {
      const bug = result[0];
      bug.comments = result[1];
      result[0].comments = result[1];
      return bug;
    }));
  }

  get_user_by_api(username: string, apiKey: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('api_key', apiKey);
    params = params.append('names', username);
    return this.httpService.getRequest('/user', params).pipe(map(res => {
      this.currentUser$.next(new User(res.users[0]));
    }));
  }

  get_user(userParams: UserParams): Observable<any> {
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

    return this.httpService.getRequest('/user', params).pipe(map(res => {
      this.currentUser$.next(new User(res.users[0]));
      return res;
    }));
  }

  get_product_versions() {
    let params = new HttpParams();
    const names = Object.keys(StaticData.PRODUCTS);
    names.forEach(name => {
      params = params.append('names', name);
    });
    return this.httpService.getRequest('/product', params).pipe(map((res: ProductResponce) => {
      return this.get_structured_versions(res);
    }));
  }

  get_structured_versions(responce: ProductResponce): StructuredProductVersions {
    const result: StructuredProductVersions = {};
    responce.products.forEach(product => {
      result[product.name] = product.versions;
    });
    return result;
  }

  get_user_data(): Observable<true> {
    const comment = this.get_comment_by_id(StaticData.COMMENT_WITH_USER_DATA);
    const attachments = this.get_attachments(StaticData.BUG_WITH_ATTACHMENTS);
    const versions = this.get_product_versions();
    return forkJoin([comment, attachments, versions]).pipe(map(result => {
      this.versions$.next(result[2]);
      const avatars = this.restructure_attachments(result[1]);
      // test needed
      const users = {};
      JSON.parse(result[0].text).forEach((userData: {email: string, real_name: string}) => {
        const newUser = new User(userData);
        newUser.avatar = avatars[newUser.username];
        users[newUser.username] = newUser;
      });
      this.users$.next(users);
      return true;
    }));
  }

  restructure_attachments(attachments: AttachmentResponce): {[key: string]: SafeUrl} {
    const restructuredAttachments = {};
    attachments.bugs[StaticData.BUG_WITH_ATTACHMENTS].filter(attachment => attachment.is_obsolete === 0).forEach(attachment => {
      restructuredAttachments[attachment.summary] = this.sanitizer_data(attachment);
    });
    return restructuredAttachments;
  }

  sanitizer_data(attachment: AttachmentResponceObject): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl('data:' + attachment.content_type + ';base64,' + attachment.data);
  }

  update_bug(id: number, updateBugData: UpdateBugParams) {
    return this.httpService.putRequest('/bug/' + id, updateBugData).pipe(map(responce => {
      return responce.bugs[0];
    }));
  }

  create_comment(bugId: number, comment: string): Observable<Comment> {
    let params = {
      comment,
      is_markdown: true
    };

    const url = '/bug/' + bugId + '/comment';
    return this.httpService.postRequest(url, params).pipe(switchMap((res: {id: number}) => {
      return this.get_comment_by_id(res.id)
    }));
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
