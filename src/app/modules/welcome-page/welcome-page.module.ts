import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomePageRoutingModule } from './welcome-page-routing.module';
import { WelcomePageMainComponent } from './welcome-page-main/welcome-page-main.component';
import {LoginModule} from './login/login.module';
import { ContentComponent } from './content/content.component';
import { RegistrationComponent } from './registration/registration.component';
import {FlexModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatStepperModule} from '@angular/material';


@NgModule({
  declarations: [
    WelcomePageMainComponent,
    ContentComponent,
    RegistrationComponent
  ],
  imports: [
    CommonModule,
    WelcomePageRoutingModule,
    LoginModule,
    FlexModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class WelcomePageModule { }
