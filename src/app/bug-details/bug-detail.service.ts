import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Bug } from '../models/bug';

@Injectable()
export class BugDetailService {
  bug$: ReplaySubject<Bug> = new ReplaySubject(0);
  constructor() { }
}
