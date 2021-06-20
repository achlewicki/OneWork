import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './services/auth-guard/auth-guard.service';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/welcome-page/welcome-page.module').then(module => module.WelcomePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home-page/home-page.module').then(module => module.HomePageModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
