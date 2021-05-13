import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetailCommentTextComponent } from './detail-comment-text.component';

describe('DetailCommentTextComponent', () => {
  let component: DetailCommentTextComponent;
  let fixture: ComponentFixture<DetailCommentTextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailCommentTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCommentTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
