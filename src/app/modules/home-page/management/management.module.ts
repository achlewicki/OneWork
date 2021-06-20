import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementViewComponent } from './management-view/management-view.component';
import { ManagementEmployeesListComponent } from './management-employees-list/management-employees-list.component';
import { ManagementEmployeeDetailsComponent } from './management-employee-details/management-employee-details.component';
import {FlexModule} from '@angular/flex-layout';
import {
    MatAutocompleteModule, MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule, MatSelectModule, MatSliderModule,
    MatSlideToggleModule, MatTooltipModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ManagementEmployeeLogsComponent } from './management-employee-logs/management-employee-logs.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';



@NgModule({
  declarations: [
    ManagementViewComponent,
    ManagementEmployeesListComponent,
    ManagementEmployeeDetailsComponent,
    ManagementEmployeeLogsComponent,
  ],
    imports: [
        CommonModule,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatListModule,
        MatSelectModule,
        MatSliderModule,
        MatTooltipModule,
        FontAwesomeModule,
        FormsModule,
        MatButtonModule
    ]
})
export class ManagementModule { }
