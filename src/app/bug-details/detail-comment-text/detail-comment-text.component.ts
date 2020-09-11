import { Component, OnInit, Input } from '@angular/core';

export interface CommentTextObjectsInterface {
  commentType?: 'push' | 'generic-comment' | 'duplicate-message';
  objects?: any[];
  id?: number;
}

export interface CommitResultObjectInterface {
  branch?: string;
  link?: string;
  message?: string;
  author?: string;
}

export interface DuplicateMessageObjectInterface {
  id?: number;
}

@Component({
  selector: 'app-detail-comment-text',
  templateUrl: './detail-comment-text.component.html',
  styleUrls: ['./detail-comment-text.component.scss']
})
export class DetailCommentTextComponent implements OnInit {
  @Input() text: string;
  commentTextObjects: CommentTextObjectsInterface = {};

  constructor() { }

  ngOnInit(): void {
    if (this.text.indexOf('Commit pushed to') === 0) {
      this.commentTextObjects.commentType = 'push';
      this.commentTextObjects.objects = this.parce_pushed_commit(this.text);
    } else if(this.text.indexOf('marked as a duplicate') >= 0) {
      this.commentTextObjects.commentType = 'duplicate-message';
      this.parce_duplicate_message();
    } else {
      this.commentTextObjects.commentType = 'generic-comment';
      this.commentTextObjects.objects = [this.text];
    }
  }

  parce_pushed_commit(text: string) {
    const results: CommitResultObjectInterface = {};
    results.branch = this.text.match(/Commit pushed to.(\S*)/)[1].trim();
    results.link = this.text.match(/^https:\/\/github.com.*/gm)[0].trim();
    if (/Author:(.*)/.test(this.text)) {
      results.author = this.text.match(/Author:(.*)/)[1].trim();
    }
    if (/Message:(.*)/.test(this.text)) {
      results.message = this.text.match(/Message:(.*)/)[1].trim();
    } else {
      results.message = this.text.match(/\n.*(?!.*\n)/)[0].trim();
    }
    return [results];
  }

  parce_duplicate_message() {
    const results: DuplicateMessageObjectInterface = {};
    this.commentTextObjects.objects = [this.text];
    this.commentTextObjects.id = +this.text.match(/\d+/gm)[0].trim();
  }
}
