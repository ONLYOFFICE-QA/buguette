import { SafeUrl } from '@angular/platform-browser';

export interface UserResponceData {
  id?: string;
  real_name?:string;
  email: string;
  avatar?: string;
}

// this object describe bug
export class User {
  id?: string;
  username: string;
  real_name?: string;
  email: string;
  avatar?: SafeUrl;
  constructor(bugData: UserResponceData) {
    this.id = bugData['id']

    // real_name from bugzilla, but without dots because some of real names exist dots, and some not
    this.real_name = bugData['real_name']?.replace(/\./g,' ')
    this.email = bugData['email']
    this.username = bugData['email'].split('@')[0] // just for avatars
  }
}
