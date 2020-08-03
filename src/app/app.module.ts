import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginPageComponent } from './login-page/login-page.component';
import { MainPageComponent, MainPageDialogSettings } from './main-page/main-page.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { HttpService } from './services/http-request.service';
import { BugzillaService } from './services/bugzilla.service';
import { MaterialModule } from './material/material.module';
import { SearchPageComponent } from './search-page/search-page.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { BugDetailsComponent } from './bug-details/bug-details.component';
import { BugDetailService } from './bug-details/bug-detail.service';
import { DetailAttachmentComponent } from './bug-details/detail-attachment/detail-attachment.component';
import { DetailCommentTextComponent } from './bug-details/detail-comment-text/detail-comment-text.component';
import { BookmarksService } from './services/bookmarks.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MainPageComponent, MainPageDialogSettings,
    SearchPageComponent,
    BugDetailsComponent,
    DetailAttachmentComponent,
    DetailCommentTextComponent,
  ],
  imports: [
    HttpClientModule,
    MaterialModule,
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    ScrollingModule,
  ],
  providers: [AuthGuardService, HttpService, BugzillaService, BugDetailService, BookmarksService],
  bootstrap: [AppComponent]
})
export class AppModule { }
