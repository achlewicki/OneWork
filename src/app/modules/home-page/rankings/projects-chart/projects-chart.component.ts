import { Component, OnInit } from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {Label, SingleDataSet} from 'ng2-charts';
import {ProjectsService} from '../../../../services/projects-service/projects.service';

@Component({
  selector: 'one-work-projects-chart',
  templateUrl: './projects-chart.component.html',
  styleUrls: ['./projects-chart.component.scss']
})
export class ProjectsChartComponent implements OnInit {
  private statuses: number[] = [0,0,0,0,0,0];
  private dataLoaded: boolean = false;
  private chartType: ChartType = 'pie';
  private pieLabels: Label[] = ['Aktywne', 'Zakończone', 'Zarchiwizowane', 'Anulowane', 'Nierozpoczęte', 'Wstrzymane'];
  private pieData: SingleDataSet = [];
  private pieOptions: ChartOptions = {
    tooltips: {
      // enabled: false
    },
    title: {
      text: 'Aktualny podział projektów',
      fontColor: 'black',
      fullWidth: true,
      lineHeight: 4,
      fontFamily: 'Nunito',
      fontSize: 22,
      display: true
    },

    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        // boxWidth: 20,
        fontColor: 'black',
        fontFamily: 'Nunito',
        fontSize: 16,
        padding: 30
      }
    },

    responsive: true,
  }

  constructor(private readonly projectsService: ProjectsService) { }

  async ngOnInit() {
    await this.projectsService.getProjects().subscribe(async promise => {
      this.statuses = [0,0,0,0,0,0]
      await promise.then(projects => {
        projects.forEach(async project => {
          this.statuses[parseInt(project.statusId)]++
        })
      }).then(() => {
        this.pieData.push(this.statuses)
        this.dataLoaded = true;
      })
    })
  }

}
