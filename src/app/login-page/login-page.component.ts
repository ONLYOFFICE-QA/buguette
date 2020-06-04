import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BugzillaService, UserData, userParams } from '../services/bugzilla.service';

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
  public loading = false;
  private formSubmitAttempt: boolean;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bugzilla: BugzillaService,
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
  }

  onSubmit() {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      this.loading = true;
      const username = this.form.get('username').value;
      const password = this.form.get('password').value;
      this.bugzilla.login(username, password).subscribe((res: UserData) => {
        this.login(res);
        this.bugzilla.get_user({'names': username}).subscribe();
      }, err => this.login_invalid(err));
    } else {
      this.formSubmitAttempt = true;
    }
  }

  onSubmitToken() {
    if (this.formKey.valid) {
      this.loading = true;
      const params: userParams = {};
      params['names'] = this.formKey.get('username').value
      params['apiKey'] = this.formKey.get('key').value
      this.bugzilla.get_user(params).subscribe(res => {
        this.api_token_authorize(params.names, params.apiKey);
      }, err => {
        this.token_invalid(err);
      });
    } else {
      this.formSubmitAttempt = true;
    }
  }

  login_invalid(err) {
    this.loading = false;
    this.loginInvalid = true;
    console.error(err);
  }

  token_invalid(err) {
    this.loading = false;
    this.tokenInvalid = true;
    console.error(err);
  }

  login(res: UserData) {
    this.loading = false;
    localStorage.setItem('user_data', JSON.stringify({ id: res.id, token: res.token }));
    this.router.navigate(['/']);
  }

  api_token_authorize(username: string, apiKey: string) {
    this.loading = false;
    localStorage.setItem('user_data', JSON.stringify({ api_key: apiKey, username: username }));
    this.router.navigate(['/']);
  }
}
