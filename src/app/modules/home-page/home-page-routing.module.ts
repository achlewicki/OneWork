import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageMainComponent} from './home-page-main/home-page-main.component';
import {DashboardComponent} from './dashboard/dashboard/dashboard.component';
import {ProjectDetailsComponent} from './projects/project-details/project-details.component';
import {ProjectsComponent} from './projects/projects/projects.component';
import {RankingsViewComponent} from './rankings/rankings-view/rankings-view.component';
import {SettingsComponent} from './settings/settings/settings.component';
import {MessagesViewComponent} from './messages/messages-view/messages-view.component';
import {ManagementViewComponent} from './management/management-view/management-view.component';
import {SharedDataService} from '../../services/_shared-data/shared-data.service'

const routes: Routes = [
  {
    path: '',
    component: HomePageMainComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'project-details',
        component: ProjectDetailsComponent,
      },
      {
        path: 'projects',
        component: ProjectsComponent,
      },
      {
        path: 'ranking',
        component: RankingsViewComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'messages',
        component: MessagesViewComponent,
      },
      {
        path: 'management',
        component: ManagementViewComponent,
        canActivate: [SharedDataService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
