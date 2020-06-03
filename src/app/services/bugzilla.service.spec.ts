import { TestBed } from '@angular/core/testing';

import { BugzillaService } from './bugzilla.service';

describe('BugzillaService', () => {
  let service: BugzillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugzillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
