
export interface CommentResponce {
  [index: number]: { comments: CommentResponceData[] }
}

export interface CommentResponceData {
  id: number;
  bugId: number;
  attachment_id: string;
  creationTime: string;
  creator: string;
  text: string;
  count: string;
}

// this object describe comment
export class Comment {
  id: number;
  bugId: number;
  attachment_id: string;
  creationTime: string;
  creator: string;
  text: string;
  count: string;
  constructor(commentData: CommentResponceData) {
    this.id = commentData['id']
    this.bugId = commentData['bug_id']
    this.attachment_id = commentData['attachment_id']
    this.creationTime = commentData['creation_time']
    this.creator = commentData['creator']
    this.text = commentData['text']
    this.count = commentData['count']
  }
}
