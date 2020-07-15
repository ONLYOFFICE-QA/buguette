import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
export class SearchKeeperService {
  currentSearch$: BehaviorSubject<CustomSearch> = new BehaviorSubject({})
  emptyCustomSearch: CustomSearch = {products: [], quick_search: ''};

  constructor() {
    this.currentSearch$.next(this.get_current_search());
  }

  private get_current_search(): CustomSearch {
    const _currentSearch = localStorage.getItem('current_search');
    if (!_currentSearch) {
      return this.emptyCustomSearch;
    }
    return JSON.parse(_currentSearch);
  }

  private save_current_search(current_search: CustomSearch): void {
    localStorage.setItem('current_search', JSON.stringify(current_search));
    this.currentSearch$.next(current_search);
  }

  public products_current_search_change(products: number[]): void {
    let _currentSearch: CustomSearch = this.get_current_search();
    _currentSearch.products = products
    this.save_current_search(_currentSearch);
  }
}
