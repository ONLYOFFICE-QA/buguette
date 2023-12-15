import { Comment, CommentResponceData } from './comment';

export interface BugResponceData {
  id?: number;
  product?: string;
  component?: string;
  status?: string;
  resolution?: string;
  severity?: string;
  importance?: string;
  summary?: string;
  priority?: string;
  creation_time?: string;
  version?: string;
  last_change_time?: string;
  assigned_to?: string; // eslint-disable-line variable-name
  creator?: string; // eslint-disable-line variable-name
  qa_contact?: string; // eslint-disable-line variable-name
  qa_contact_detail?: UserDetail; // eslint-disable-line variable-name
  assigned_to_detail?: UserDetail; // eslint-disable-line variable-name
  creator_detail?: UserDetail; // eslint-disable-line variable-name
}

export interface UserDetail {
  real_name: string; // eslint-disable-line variable-name
  realName: string;
  id: number;
  email: string;
  name: string;
  username: string;
}

// this object describe bug
export class Bug {
  id: number;
  product: string;
  component: string;
  version: string;
  summary: string;
  severity: string;
  status: string;
  resolution: string;
  buguetteStatus: string;
  priority: string;
  qaContact: string;
  qaContactDetail: UserDetail;
  assignedTo: string;
  // set default assignedToDetail because it can be empty
  assignedToDetail: UserDetail = {  realName: '', id: 0, email: '', name: '', username: '', real_name: ''};
  creator: string;
  creatorDetail: UserDetail;
  comments: Comment[] = [];
  isEmpty = false;
  creationTime: Date;
  lastChangeTime: Date;
  buguetteStatusColor: string;
  constructor(bugData: BugResponceData) {
    this.id = bugData.id;
    this.summary = bugData.summary;
    this.product = bugData.product;
    this.component = bugData.component;
    this.version = bugData.version;
    this.status = bugData.status;
    this.resolution = bugData.resolution;
    this.severity = bugData.severity;
    this.priority = bugData.priority;
    this.qaContact = bugData.qa_contact;
    if (this.qaContact) {
      this.qaContactDetail = this.get_user_detail(bugData.qa_contact_detail);
    }
    this.assignedTo = bugData.assigned_to;
    this.assignedToDetail = this.get_user_detail(bugData.assigned_to_detail);
    this.creator = bugData.creator;
    this.creatorDetail = this.get_user_detail(bugData.creator_detail);
    this.buguetteStatus = this.get_buguette_status();
    this.buguetteStatusColor = this.get_buguette_statusColor();
    this.creationTime = new Date(bugData.creation_time);
    this.lastChangeTime = this.set_lastChangeTime(bugData.last_change_time);
  }

  set_lastChangeTime(stringDate: string): Date {
    return new Date(stringDate);
  }

  set_severity(severity: string): void {
    this.severity = severity;
  }

  set_resolution(resolution: string): void {
    this.resolution = resolution;
    this.buguetteStatus = this.get_buguette_status();
    this.get_buguette_statusColor();
  }

  set_status(status: string): void {
    this.status = status;
    this.buguetteStatus = this.get_buguette_status();
    this.get_buguette_statusColor();
  }

  get_buguette_status(): string {
    switch (this.status) {
      case 'RESOLVED': {
        return 'RESOLVED';
      }
      case 'VERIFIED': {
        return 'VERIFIED';
      }
      default: {
         return this.status;
      }
   }
  }

  get_buguette_statusColor() {
    if (this.resolution === 'INVALID' || this.resolution === 'WANTFIX') {
      return 'red';
    } else {
      return 'black';
    }
  }

  get_user_detail(data: UserDetail): UserDetail {
    const detail = data;
    detail.username = data.email.split('@')[0].toLowerCase();
    detail.realName = data.real_name;
    return detail;
  }

  add_new_comment(comment: CommentResponceData): void {
    this.comments.push(new Comment(comment));
  }
}
