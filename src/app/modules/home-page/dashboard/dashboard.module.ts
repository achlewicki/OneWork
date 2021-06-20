import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardComponent} from './dashboard/dashboard.component';
import {FlexModule} from '@angular/flex-layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [
    DashboardComponent
  ],
    imports: [
        CommonModule,
        FlexModule,
        FontAwesomeModule
    ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
