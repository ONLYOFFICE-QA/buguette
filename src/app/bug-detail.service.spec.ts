import { TestBed } from '@angular/core/testing';

import { BugDetailService } from './bug-detail.service';

describe('BugDetailService', () => {
  let service: BugDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
