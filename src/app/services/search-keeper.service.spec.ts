import { TestBed } from '@angular/core/testing';

import { SearchKeeperService } from './search-keeper.service';

describe('SearchKeeperService', () => {
  let service: SearchKeeperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchKeeperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
