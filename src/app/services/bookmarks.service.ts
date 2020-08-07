import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { SavedSearchObject } from '../models/user';
import { BugzillaService } from './bugzilla.service';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  public currentBookmark$: ReplaySubject<SavedSearchObject> = new ReplaySubject(1);

  constructor(private bugzillaService: BugzillaService) { }

  public keep_to_bookmarks(params: SavedSearchObject) {
    this.bugzillaService.currentUser$.pipe(take(1), map(user => {
      this.save_bookmarks_to_storage(params);
      user.savedSearches$.next();
    })).subscribe();
  }

  public delete_bookmark(name: string) {
    this.bugzillaService.currentUser$.pipe(take(1), map(user => {
      const bookmarks = this.get_bookmarks_from_storage();
      if (bookmarks[name]) {
        delete bookmarks[name];
      }
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      user.savedSearches$.next();
    })).subscribe();
  }

  public apply_search(bookmark) {
    this.currentBookmark$.next(bookmark);
  }

  private get_bookmarks_from_storage() {
    const bookmarks = localStorage.getItem('bookmarks');
    if (!bookmarks) {
      return {};
    }
    return JSON.parse(bookmarks);
  }

  private save_bookmarks_to_storage(bookmark: SavedSearchObject): void {
    const correntBookmarksPack = this.get_bookmarks_from_storage();
    correntBookmarksPack[bookmark.name] = bookmark;
    localStorage.setItem('bookmarks', JSON.stringify(correntBookmarksPack));
  }
}
