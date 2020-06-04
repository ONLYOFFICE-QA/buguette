
export interface UserResponceData {
  id?: string;
  name: string;
  real_name?:string;
  email: string;
}

// this object describe bug
export class User {
  id: string;
  name: string;
  real_name: string;
  email: string;
  constructor(bugData: UserResponceData) {
    this.id = bugData['id']
    this.name = bugData['name']
    this.real_name = bugData['real_name']
    this.email = bugData['email']
  }
}
