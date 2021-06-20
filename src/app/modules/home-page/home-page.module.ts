import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageRoutingModule } from './home-page-routing.module';
import {ProjectsModule} from './projects/projects.module';
import {SettingsModule} from './settings/settings.module';
import {DashboardModule} from './dashboard/dashboard.module';
import {RankingsModule} from './rankings/rankings.module';
import {NavigationBarModule} from './navigation-bar/navigation-bar.module';
import {HomePageMainComponent} from './home-page-main/home-page-main.component';
import {FlexModule} from '@angular/flex-layout';
import {MessagesModule} from './messages/messages.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule, MatDialog, MatDialogModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {DialogsModule} from './dialogs/dialogs.module';
import {ManagementModule} from './management/management.module';
import {PresenceComponent} from './dialogs/presence/presence.component';
import {DisabledEmployeeComponent} from './dialogs/disabled-employee/disabled-employee.component';


@NgModule({
  declarations: [
    HomePageMainComponent,
    ],
    imports: [
        CommonModule,
        HomePageRoutingModule,
        ProjectsModule,
        SettingsModule,
        DashboardModule,
        RankingsModule,
        NavigationBarModule,
        FlexModule,
        MessagesModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        DialogsModule,
        ManagementModule,
        MatDialogModule
    ],
  exports: [
    HomePageMainComponent,
  ],

  providers: [
    MatDialog,
  ],

  entryComponents: [
    PresenceComponent,
    DisabledEmployeeComponent
  ]

})
export class HomePageModule { }
