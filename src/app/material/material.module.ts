import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
// import { FlexLayoutModule } from "@angular/flex-layout/flexbox";
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatRippleModule} from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTabsModule,
    MatInputModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatExpansionModule,
    MatListModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatRippleModule
  ],
  exports: [
    MatToolbarModule,
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatInputModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ScrollingModule,
    MatBadgeModule,
    MatExpansionModule,
    MatListModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatRippleModule
  ]
})
export class MaterialModule { }
