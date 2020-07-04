
export interface CommentResponce {
  [index: number]: { comments: CommentResponceData[] }
}

export interface CommentResponceData {
  id: number;
  bugId: number;
  attachment_id: number;
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
  attachment_id: number;
  attachment_name: string;
  creation_time: string;
  creator_username: string;
  creator: string;
  text: string;
  count: string;
  attachment_is_image: boolean;
  constructor(commentData: CommentResponceData) {
    this.id = commentData['id']
    this.bugId = commentData['bug_id']
    this.creation_time = commentData['creation_time']
    this.creator = commentData['creator']
    this.creator_username = this.get_creator_username(commentData['creator'])
    this.text = this.get_text(commentData['text'])
    this.attachment_id = commentData['attachment_id']
    if (this.attachment_id) {
      this.attachment_name = this.get_attachment_name(commentData['text'])
      this.attachment_is_image = this.attachment_is_image_check()
    }
    this.count = commentData['count']
  }

  get_creator_username(email: string) {
    return email.split('@')[0];
  }

  get_attachment_name(text: string): string {
    return text.split('\n')[1]
  }

  attachment_is_image_check(): boolean {
    let result = (/\.(gif|jpe?g|tiff|png|webp|bmp)$/i).test(this.attachment_name)
    if (!result) {
      let name = this.attachment_name.toLowerCase();
      result = ["скриншот", "screen"].some(x => name.indexOf(x) >= 0)
    }
    return result
  }

  get_text(text: string): string {
    if (/Created\ attachment\s(\d+)/.test(text.split('\n')[0])) {
      let newText = text.split('\n')
      newText.splice(0, 3)
      text = newText.join('\n');
    }
    return text;
  }
}
