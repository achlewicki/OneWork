import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProjectsComponent} from './projects/projects.component';
import {FlexModule} from '@angular/flex-layout';
import {
  MatButtonModule,
  MatButtonToggleModule, MatDialog, MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule, MatInputModule,
  MatSlideToggleModule,
  MatTooltipModule
} from '@angular/material';
import {ProjectDetailsComponent} from './project-details/project-details.component';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AddEditProjectComponent} from '../dialogs/add-edit-project/add-edit-project.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {DialogsModule} from '../dialogs/dialogs.module';



@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectDetailsComponent
  ],
  imports: [
    CommonModule,
    FlexModule,
    MatButtonToggleModule,
    RouterModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    DialogsModule,
    FontAwesomeModule
  ],
  exports: [
    ProjectsComponent
  ],
  providers: [
    MatDialog,
  ],
  entryComponents: [
    AddEditProjectComponent
  ]
})
export class ProjectsModule { }
