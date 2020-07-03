import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAttachmentComponent } from './detail-attachment.component';

describe('DetailAttachmentComponent', () => {
  let component: DetailAttachmentComponent;
  let fixture: ComponentFixture<DetailAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
