import { Product } from '../services/bugzilla.service';

export interface BugResponceData {
  id?: string;
  product?: string;
  status?:string;
  importance?: string;
  summary?: string;
  priority?: string;
  assain?: string;
}

// this object describe bug
export class Bug {
  id: string;
  product: string;
  summary: string;
  severity: string;
  priority: string;
  assain: string;
  isEmpty = false;
  constructor(bugData: BugResponceData) {
    this.id = bugData['id']
    this.summary = bugData['summary']
    this.assain = bugData['assain']
    this.product = bugData['product']
    this.severity = bugData['severity']
    this.priority = bugData['priority']
  }
}

export class BugEmpty extends  Bug {
  isEmpty = true;
  constructor() {
    super(new Object)
  }
}
