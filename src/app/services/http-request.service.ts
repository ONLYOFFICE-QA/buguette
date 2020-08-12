import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()

export class HttpService {

  constructor(private http: HttpClient) {}

  getRequest(path: string, params: HttpParams): Observable<any> {
    if (localStorage.getItem('user_data')) {
      params = this.user_data(params);
    }
    return this.http.get('https://bugzilla.onlyoffice.com/rest' + path, { params });
  }

  postRequest(path: string, params): Observable<any> {
    if (localStorage.getItem('user_data')) {
      params = this.user_data_json_append(params);
    }
    return this.http.post<any>('https://bugzilla.onlyoffice.com/rest' + path, params);
  }

  putRequest(path: string, params): Observable<any> {
    if (localStorage.getItem('user_data')) {
      params = this.user_data_json_append(params);
    }
    return this.http.put('https://bugzilla.onlyoffice.com/rest' + path, params);
  }

  user_data(params: HttpParams): HttpParams {
    const userdata = JSON.parse(localStorage.getItem('user_data'));
    if (userdata.token) {
      params = params.append('token', JSON.parse(localStorage.getItem('user_data')).token);
    } else if (userdata.api_key) {
      params = params.append('api_key', JSON.parse(localStorage.getItem('user_data')).api_key);
    }
    return params;
  }

  user_data_json_append(params) {
    const userdata = JSON.parse(localStorage.getItem('user_data'));
    if (userdata.token) {
      params.token = JSON.parse(localStorage.getItem('user_data')).token;
    } else if (userdata.api_key) {
      params.api_key = JSON.parse(localStorage.getItem('user_data')).api_key;
    }
    return params;
  }
}
