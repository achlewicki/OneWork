import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavigationBarComponent} from './navigation-bar/navigation-bar.component';
import {FlexModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatTooltipModule} from '@angular/material';
import {CompanyManagementComponent} from '../dialogs/company-management/company-management.component';



@NgModule({
  declarations: [
    NavigationBarComponent
  ],

  imports: [
      CommonModule,
      FlexModule,
      RouterModule,
      FontAwesomeModule,
      MatTooltipModule
  ],

  exports: [
    NavigationBarComponent
  ],

  entryComponents: [
    CompanyManagementComponent
  ]
})
export class NavigationBarModule { }
