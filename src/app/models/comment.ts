
export interface CommentResponce {
  [index: number]: { comments: CommentResponceData[] };
}

export interface CommentResponceData {
  id: number;
  bug_id: number; // eslint-disable-line variable-name
  attachment_id: number; // eslint-disable-line variable-name
  creation_time: string; // eslint-disable-line variable-name
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
  attachmentId: number;
  attachmentName: string;
  creationTime: Date;
  creatorUsername: string;
  creator: string;
  text: string;
  count: string;
  attachmentIsImage: boolean;
  constructor(commentData: CommentResponceData) {
    this.id = commentData.id;
    this.bugId = commentData.bug_id;
    this.creationTime = new Date(commentData.creation_time);
    this.creator = commentData.creator;
    this.creatorUsername = this.get_creator_username(commentData.creator);
    this.text = this.get_text(commentData.text);
    this.attachmentId = commentData.attachment_id;
    if (this.attachmentId) {
      this.attachmentName = this.get_attachment_name(commentData.text);
      this.attachmentIsImage = this.attachment_is_image_check();
    }
    this.count = commentData.count;
  }

  get_creator_username(email: string) {
    return email.split('@')[0];
  }

  get_attachment_name(text: string): string {
    return text.split('\n')[1];
  }

  attachment_is_image_check(): boolean {
    let result = (/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(this.attachmentName);
    if (!result) {
      const name = this.attachmentName.toLowerCase();
      result = ['скринш', 'screen'].some(x => name.indexOf(x) >= 0);
    }
    return result;
  }

  get_text(text: string): string {
    if (/Created\ attachment\s(\d+)/.test(text.split('\n')[0])) {
      const newText = text.split('\n');
      newText.splice(0, 3);
      text = newText.join('\n');
    }
    return text;
  }
}
