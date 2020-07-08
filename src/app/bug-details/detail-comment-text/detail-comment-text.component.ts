import { Component, OnInit, Input } from '@angular/core';

export interface CommentTextObjectsInterface {
  commentType?: "push" | "generic-comment";
  objects?: any[];
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
    console.log(this.text);
    if (this.text.indexOf('Commit pushed to') === 0) {
      this.commentTextObjects.commentType = "push";
      this.commentTextObjects.objects = this.parce_pushed_commit(this.text);
    } else {
      this.commentTextObjects.commentType = "generic-comment";
      this.commentTextObjects.objects = [this.text];
    }
  }

  parce_pushed_commit(text: string) {
    let branch = this.text.match(/refs\/heads\/(.*)/)[1].trim();
    let link = this.text.match(/https:\/\/github.com.*/)[0].trim();
    let author = this.text.match(/Author:(.*)/)[1].trim();
    let message = this.text.match(/Message:(.*)/)[1].trim();
    return [{author, branch, link, message}];
  }

}
