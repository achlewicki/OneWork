import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SettingsComponent} from './settings/settings.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule} from '@angular/material';
import {FlexModule} from '@angular/flex-layout';



@NgModule({
  declarations: [
    SettingsComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FlexModule,
        MatSnackBarModule
    ],
  exports: [
    SettingsComponent
  ]
})
export class SettingsModule { }
