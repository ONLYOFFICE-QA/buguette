import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BugzillaService, UserData } from '../services/bugzilla.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  form: FormGroup;
  formToken: FormGroup;
  public loginInvalid: boolean;
  public tokenInvalid: boolean;
  public loading = false;
  private formSubmitAttempt: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bugzilla: BugzillaService,
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.email],
      password: ['', Validators.required]
    });

    this.formToken = this.fb.group({
      username: ['', Validators.email],
      token: [''],
    });
  }

  async onSubmit() {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      this.loading = true;
      const username = this.form.get('username').value;
      const password = this.form.get('password').value;
      this.bugzilla.login(username, password).subscribe((res: UserData) => this.login(res), err => this.login_invalid(err));
    } else {
      this.formSubmitAttempt = true;
    }
  }

  onSubmitToken() {
    if (this.formToken.valid) {
      this.loading = true;
      const username = this.formToken.get('username').value;
      const apiKey = this.formToken.get('token').value;
      this.bugzilla.get_user(username, apiKey).subscribe(res => {
        this.api_token_authorize(username, apiKey);
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
    localStorage.setItem('user_data', JSON.stringify({id: res.id, token: res.token}));
    this.router.navigate(['/']);
  }

  api_token_authorize(username: string, apiKey: string) {
    this.loading = false;
    localStorage.setItem('user_data', JSON.stringify({api_key: apiKey, username: username}));
    this.router.navigate(['/']);
  }
}
