import { SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { StaticData } from '../static-data';
import { map } from 'rxjs/operators';

export interface UserResponceData {
  id?: string;
  real_name?: string;
  email: string;
  avatar?: string;
  saved_searches?: SavedSearchObject[];
}

export interface SavedSearchObject {
  id?: number;
  name: string;
  query?: string;
  fromBugzilla: boolean;
  saved_search: CustomSearch;
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
  resolutions?: number[];
  sorting_by_updated?: boolean;
}


// this object describe bug
export class User {
  id?: string;
  username: string;
  realName?: string;
  email: string;
  avatar?: SafeUrl;
  savedSearches$;
  savedSearches: SavedSearchObject[] = [];
  constructor(UserData: UserResponceData) {
    this.id = UserData.id;

    // real_name from bugzilla, but without dots because some of real names exist dots, and some not
    this.realName = UserData.real_name?.replace(/\./g, ' ');
    this.email = UserData.email;
    this.username = this.get_username(UserData.email); // just for avatars
    if (UserData.saved_searches) {
      this.get_saved_searches(UserData.saved_searches);
    }

    this.savedSearches$ = new BehaviorSubject([]).pipe(map(() => {
      return this.get_saved_searches_from_storage();
    }));
  }

  get_username(email: string) {
    return email?.split('@')[0].toLowerCase();
  }

  get_saved_searches(savedSearchesData: SavedSearchObject[]) {
    savedSearchesData.forEach(currentSavedSearch => {
      currentSavedSearch.saved_search = {};
      const params = new URLSearchParams('www.mysite.com?&' + currentSavedSearch.query);
      currentSavedSearch.saved_search.products = this.get_ids_by_names(params.getAll('product'), StaticData.PRODUCTS);
      currentSavedSearch.saved_search.creator = this.get_reporter(params);
      currentSavedSearch.saved_search.assigned = this.get_assigned_to(params);
      currentSavedSearch.saved_search.resolutions = this.get_ids_by_names(params.getAll('resolution'), StaticData.STATUSES);
      currentSavedSearch.saved_search.severities = this.get_ids_by_names(params.getAll('bug_severity'), StaticData.SEVERITIES);
      currentSavedSearch.saved_search.priorities = this.get_ids_by_names(params.getAll('priority'), StaticData.PRIORITIES);
      currentSavedSearch.saved_search.versions = params.getAll('version');
      const bugStatus = params.getAll('bug_status');
      currentSavedSearch.saved_search.statuses = this.get_statuse_ids_by_status_and_resulutions(bugStatus, StaticData.STATUSES);
      currentSavedSearch.fromBugzilla = true;
      this.savedSearches.push(currentSavedSearch);
    });
  }

  get_saved_searches_from_storage() {
    let bookmarks = localStorage.getItem('bookmarks');
    if (!bookmarks) {
      bookmarks = '[]';
    }
    const storBookmarks = JSON.parse(bookmarks);
    return Object.values(storBookmarks).concat(this.savedSearches);
  }

  get_reporter(params: URLSearchParams): string {
    let emailReporterNumber: string;
    ['emailreporter1', 'emailreporter2', 'emailreporter3'].forEach(emailTag => {
      if (params.get(emailTag)) {
        emailReporterNumber = emailTag[emailTag.length - 1];
        return;
      }
    });
    const email = params.get('email' + emailReporterNumber);
    return this.get_username(email);
  }

  get_assigned_to(params: URLSearchParams): string {
    let emailReporterNumber: string;
    ['emailassigned_to1', 'emailassigned_to2', 'emailassigned_to3'].forEach(emailTag => {
      if (params.get(emailTag)) {
        emailReporterNumber = emailTag[emailTag.length - 1];
        return;
      }
    });
    const email = params.get('email' + emailReporterNumber);
    return this.get_username(email);
  }

  get_ids_by_names(names: string[], object): number[] {
    const ids = [];
    names.forEach(name => {
      if (object[name]) {
        ids.push(+object[name].id);
      }
    });
    return ids;
  }

   get_statuse_ids_by_status_and_resulutions(statuses: string[], statisStatuses) {
     const result = [];
     const newStatuses = [statisStatuses.NEW.realName].concat(statisStatuses.NEW.addition || []);
     if (statuses.some(status => newStatuses.indexOf(status) !== -1)) {
       result.push(statisStatuses.NEW.id);
     }
     if (statuses.indexOf('RESOLVED') > -1) {
      result.push(statisStatuses.RESOLVED.id);
     }

     if (statuses.indexOf('VERIFIED') > -1 || statuses.indexOf('CLOSED') > -1) {
      result.push(statisStatuses.VERIFIED.id);
     }
     return result;
   }
}
