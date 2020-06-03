import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Bug, BugEmpty } from '../models/bug'

@Injectable()
export class BugDetailService {
  bug$: BehaviorSubject<Bug> = new BehaviorSubject(new BugEmpty);
  constructor() { }
}
