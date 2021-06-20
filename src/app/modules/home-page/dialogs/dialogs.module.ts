import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatDatepickerModule, MatDialog, MatDialogModule, MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatNativeDateModule,
  MatOptionModule,
  MatSelectModule, MatTooltipModule
} from '@angular/material';
import {AddEditProjectComponent} from './add-edit-project/add-edit-project.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ColorPickerModule} from 'ngx-color-picker';
import {FlexModule} from '@angular/flex-layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { PresenceComponent } from './presence/presence.component';
import { CompanyManagementComponent } from './company-management/company-management.component';
import { AddEditConversationGroupComponent } from './add-edit-conversation-group/add-edit-conversation-group.component';
import { DisabledEmployeeComponent } from './disabled-employee/disabled-employee.component';




@NgModule({
  declarations: [
    AddEditProjectComponent,
    PresenceComponent,
    CompanyManagementComponent,
    AddEditConversationGroupComponent,
    DisabledEmployeeComponent
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    ColorPickerModule,
    MatOptionModule,
    MatSelectModule,
    FlexModule,
    MatExpansionModule,
    MatButtonModule,
    FontAwesomeModule,
    MatTooltipModule,
    MatDialogModule
  ],
  exports: [
    AddEditProjectComponent,
    PresenceComponent,
    CompanyManagementComponent
  ],
})
export class DialogsModule { }
