import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginWindowComponent } from './login-window/login-window.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {FlexModule} from '@angular/flex-layout';




@NgModule({
  declarations: [LoginWindowComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FlexModule,
        MatButtonModule
    ]
})
export class LoginModule { }
