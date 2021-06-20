import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WelcomePageMainComponent} from './welcome-page-main/welcome-page-main.component';
import {ContentComponent} from './content/content.component';
import {LoginWindowComponent} from './login/login-window/login-window.component';
import {RegistrationComponent} from './registration/registration.component';


const routes: Routes = [
  {
    path: '',
    component: WelcomePageMainComponent,
    children: [
      {
        path: '',
        component: ContentComponent
      },
      {
        path: 'login',
        component: LoginWindowComponent,
      },
      {
        path: 'registration',
        component: RegistrationComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomePageRoutingModule { }
