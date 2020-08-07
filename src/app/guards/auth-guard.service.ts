import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { BugzillaService } from '../services/bugzilla.service';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuardService implements CanActivate {
  public loader$ = new BehaviorSubject<boolean>(false);

  constructor(public router: Router, private bugzilla: BugzillaService) {}
  canActivate(): Observable<boolean> {
    if (!localStorage.getItem('user_data')) {
      this.router.navigate(['login']);
      return of(false);
    }
    this.loader$.next(true);
    return this.bugzilla.get_user_data().pipe(map(x => {
      this.loader$.next(false);
      return x;
    }));
  }
}
