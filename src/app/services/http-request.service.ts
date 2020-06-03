import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()

export class HttpService {

  constructor(private http: HttpClient) {}

  getRequest(path: string, params: HttpParams): Observable<any> {
    if (localStorage.getItem('user_data')) {
      params = params.append('token', JSON.parse(localStorage.getItem('user_data')).token);
    }
    return this.http.get('https://bugzilla.onlyoffice.com/rest' + path, { params: params });
  }
}
