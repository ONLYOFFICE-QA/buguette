import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { SavedSearchObject } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  public currentBookmark$: ReplaySubject<SavedSearchObject> = new ReplaySubject(1);

  constructor() { }

  public keep_to_bookmarks() {
  }

  public apply_search(bookmark) {
    this.currentBookmark$.next(bookmark);
  }
}
