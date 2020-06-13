import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Bug, BugEmpty } from '../models/bug'

@Injectable()
export class BugDetailService {
  bug$: ReplaySubject<Bug> = new ReplaySubject(0);
  constructor() { }
}
