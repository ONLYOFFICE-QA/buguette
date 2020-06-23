
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

export interface UserDetail {
  real_name: string;
  id: number;
  email: string;
  name: string;
  username: string;
}

// this object describe comment
export class Comment {
  id: number;
  bugId: number;
  attachment_id: string;
  creation_time: string;
  creator_username: string;
  creator: string;
  text: string;
  count: string;
  constructor(commentData: CommentResponceData) {
    this.id = commentData['id']
    this.bugId = commentData['bug_id']
    this.attachment_id = commentData['attachment_id']
    this.creation_time = commentData['creation_time']
    this.creator = commentData['creator']
    this.creator_username = this.get_creator_username(commentData['creator'])
    this.text = commentData['text']
    this.count = commentData['count']
  }

  get_creator_username(email: string) {
    return email.split('@')[0];
  }
}
