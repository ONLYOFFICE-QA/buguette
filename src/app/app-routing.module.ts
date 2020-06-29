import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { MainPageComponent } from './main-page/main-page.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { BugDetailsComponent } from './bug-details/bug-details.component';


const routes: Routes = [
  { path: 'login', component: LoginPageComponent},
  { path: '', component: MainPageComponent, canActivate: [AuthGuardService], children: [
    { path: 'bug/:id', component: BugDetailsComponent },
  ]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
