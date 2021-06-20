import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RankingsViewComponent} from './rankings-view/rankings-view.component';
import { TopRankingComponent } from './top-ranking/top-ranking.component';
import { EffectivenessChartComponent } from './effectiveness-chart/effectiveness-chart.component';
import { ProjectsChartComponent } from './projects-chart/projects-chart.component';
import {ChartsModule, ThemeService} from 'ng2-charts';
import {FlexModule} from '@angular/flex-layout';
import {
    MatCheckboxModule,
    MatDatepickerModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';




@NgModule({
  declarations: [
    RankingsViewComponent,
    TopRankingComponent,
    EffectivenessChartComponent,
    ProjectsChartComponent
  ],
    imports: [
        CommonModule,
        ChartsModule,
        FlexModule,
        MatCheckboxModule,
        FormsModule,
        MatTableModule,
        MatSortModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        ReactiveFormsModule,
        MatRadioModule,
    ],
  exports: [
    RankingsViewComponent
  ],
  providers: [
    ThemeService
  ]
})
export class RankingsModule { }
