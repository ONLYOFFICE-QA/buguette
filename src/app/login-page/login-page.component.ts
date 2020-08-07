import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BugzillaService, UserData, UserParams } from '../services/bugzilla.service';
import { User } from '../models/user';
import { AuthGuardService } from '../guards/auth-guard.service';
import { StaticData } from '../static-data';


export interface FormStatusInterface {
  loading?: "waiting" | "start" | "complite" | "error"
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  form: FormGroup;
  formKey: FormGroup;
  public loginInvalid: boolean;
  public tokenInvalid: boolean;
  public emailInvalid: boolean;
  public loading = false;
  public buttonsDisableFlag = false;
  public formStatus: FormStatusInterface = { loading: 'waiting' };
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bugzilla: BugzillaService,
    public auth: AuthGuardService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.email],
      password: ['', Validators.required]
    });

    this.formKey = this.fb.group({
      username: ['', Validators.email],
      key: [''],
    });

    if ((window as any).PasswordCredential || (window as any).FederatedCredential) {
      (window as any).navigator.credentials.get({password: true}).then((data: {id: string, password: string}) => {
        if (data) {
          this.formKey.controls.username.setValue(data.id)
          this.formKey.controls.key.setValue(data.password)
          this.api_token_authorize(data.id, data.password)
        }
      })
     }
  }

  onSubmit() {
    this.loginInvalid = false;
    if (this.form.valid) {
      this.formStatus.loading = "start";
      this.buttonsDisableFlag = true;
      const username: string = this.form.get('username').value;
      const password = this.form.get('password').value;
      this.bugzilla.login(username, password).subscribe((res: UserData) => {
        this.login(res);
        this.bugzilla.currentUser$.next(new User({ 'email': username }));
        // this.bugzilla.get_user({'names': username}).subscribe();
      }, err => this.login_invalid(err));
    }
  }

  storePassword(username: string, password: string) {
    if ((window as any).PasswordCredential || (window as any).FederatedCredential) {
      var cred = new (window as any).PasswordCredential({
        id: username,
        password: password,
      });
      navigator.credentials.store(cred)
    }
  }

  onSubmitToken() {
    if (this.formKey.valid) {
      this.formStatus.loading = "start";
      this.buttonsDisableFlag = true;
      const params: UserParams = {};
      params['names'] = this.formKey.get('username').value
      params['apiKey'] = this.formKey.get('key').value
      this.bugzilla.get_user(params).subscribe(res => {
        if (res?.users[0].saved_searches) {
          this.api_token_authorize(params.names, params.apiKey);
        } else {
          this.email_invalid();
        }
      }, err => {
        this.token_invalid(err);
      });
    }
  }

  login_invalid(err) {
    this.loading = false;
    this.formStatus.loading = "waiting";
    this.buttonsDisableFlag = false;
    this.loginInvalid = true;
    console.error(err);
  }

  token_invalid(err) {
    this.loading = false;
    this.formStatus.loading = "waiting";
    this.buttonsDisableFlag = false;
    this.tokenInvalid = true;
    console.error(err);
  }

  email_invalid() {
    this.loading = false;
    this.formStatus.loading = "waiting";
    this.buttonsDisableFlag = false;
    this.emailInvalid = true;
  }

  login(res: UserData) {
    this.formStatus.loading = 'complite';
    localStorage.setItem('user_data', JSON.stringify({ id: res.id, token: res.token }));
    this.router.navigate(['/']);
  }

  api_token_authorize(username: string, apiKey: string) {
    this.formStatus.loading = 'complite';
    localStorage.setItem('user_data', JSON.stringify({ api_key: apiKey, username: username }));
    this.storePassword(username, apiKey)
    this.router.navigate(['/']);
  }

  get_link_to_bugzilla_api() {
    return StaticData.BUGZILLA_LINK + '/userprefs.cgi?tab=apikey';
  }
}
