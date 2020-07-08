import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCommentTextComponent } from './detail-comment-text.component';

describe('DetailCommentTextComponent', () => {
  let component: DetailCommentTextComponent;
  let fixture: ComponentFixture<DetailCommentTextComponent>;

  beforeEach(async(() => {
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
