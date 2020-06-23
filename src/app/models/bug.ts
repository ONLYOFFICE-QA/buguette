export interface BugResponceData {
  id?: number;
  product?: string;
  component?: string;
  status?: string;
  resolution?: string;
  importance?: string;
  summary?: string;
  priority?: string;
  qa_contact?: string;
  assigned_to?: string;
}

export interface UserDetail {
  real_name: string;
  id: number;
  email: string;
  name: string;
  username: string;
}

export interface Comment {
  text: string;
  creation_time: string;
  creator: string;
  creator_username: string;
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
  qa_contact: string;
  qa_contact_detail: UserDetail;
  assigned_to: string;
  // set default assigned_to_detail because it can be empty
  assigned_to_detail: UserDetail = {  real_name: "", id: 0, email: "", name: "", username: ""};
  creator: string;
  creator_detail: UserDetail;
  comments: Comment[] = [];
  isEmpty = false;
  constructor(bugData: BugResponceData) {
    this.id = bugData['id']
    this.summary = bugData['summary']
    this.product = bugData['product']
    this.component = bugData['component']
    this.version = bugData['version']
    this.status = bugData['status']
    this.resolution = bugData['resolution']
    this.severity = bugData['severity']
    this.priority = bugData['priority']
    this.qa_contact = bugData['qa_contact']
    if (this.qa_contact) {
      this.qa_contact_detail = this.get_user_detail(bugData['qa_contact_detail'])
    }
    this.assigned_to = bugData['assigned_to']
    this.assigned_to_detail = this.get_user_detail(bugData['assigned_to_detail'])
    this.creator = bugData['creator']
    this.creator_detail = this.get_user_detail(bugData['creator_detail'])
    this.buguetteStatus = this.get_buguette_status()
  }

  get_buguette_status() {
    switch(this.status) {
      case 'RESOLVED': {
        return "FIXED"
      }
      case 'VERIFIED': {
        return "VERIFIED";
      }
      default: {
         return this.status;
      }
   }
  }

  get_user_detail(data: UserDetail) {
    const detail = data;
    detail.username = data.email.split('@')[0];
    return detail;
  }
}

export class BugEmpty extends  Bug {
  isEmpty = true;
  constructor() {
    super(new Object)
  }
}
