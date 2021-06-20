import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {EffectivenessService} from '../../../../services/effectiveness-service/effectiveness.service';
import {EffectivenessModel} from '../../../../models/effectiveness.model';
import {Subscription} from 'rxjs';
import {Label} from 'ng2-charts';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {formatDate} from '@angular/common';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';

@Component({
  selector: 'one-work-effectiveness-chart',
  templateUrl: './effectiveness-chart.component.html',
  styleUrls: ['./effectiveness-chart.component.scss']
})
export class EffectivenessChartComponent implements OnInit, OnDestroy {
  @Input() employees: EmployeeModel[];
  private dataLoaded: boolean = false;
  private averageEffectiveness: boolean = false;
  private effectivenessAllEmployees: {
    employee: EmployeeModel,
    effectiveness: EffectivenessModel[]
  }[] = [];
  private minDate: Date;
  private maxDate: Date;
  private chartType: ChartType = 'bar';
  private chartLabel: Label[];
  private chartData: ChartDataSets[] = [];
  private chartOptions: ChartOptions = {
    showLines: true,
    tooltips: {
      // enabled: false
    },
    title: {
      text: 'Miesięczna skuteczność',
      fontColor: 'black',
      fullWidth: true,
      lineHeight: 2,
      fontFamily: 'Nunito',
      fontSize: 22,
      display: true
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutBounce',
      // animateRotate: false
    },
    legend: {
      position: 'right',
      labels: {
        boxWidth: 20,
        fontColor: 'black',
        fontFamily: 'Nunito',
        fontSize: 16,
        padding: 30
      }
    },

    responsive: true,
    scales: {
      yAxes: [
        {
          gridLines: {
            // color: 'rgba(250,250,250,1)',
            // drawOnChartArea: false
          },
          ticks: {
            beginAtZero: true,
            max: 10,
            fontFamily: 'Arial',
            fontColor: 'black',
            fontSize: 16
          }
        }
      ],

      xAxes: [
        {
          gridLines: {
            color: 'rgba(250,250,250,1)'
            // color: 'white'
            // drawOnChartArea: false
          },
          ticks: {
            minRotation: 60,
            fontFamily: 'Arial',
            fontColor: 'black',
            fontSize: 16
          }
        }
        ]
    },
  }
  private subscriber$: Subscription;
  private datesForm: FormGroup;


  constructor(private readonly effectivenessService: EffectivenessService,
              private readonly formBuilder: FormBuilder,
              private readonly sharedData: SharedDataService) { }

  async ngOnInit() {
    this.datesForm = this.formBuilder.group({
      dateFrom: new Date(Date.now() - 15552000000),
      dateTo: new Date(Date.now())
    })

    this.setMinDate();
    this.setMaxDate();

    await this.loadChangelogs()
  }

  ngOnDestroy() {
    // this.subscriber$.unsubscribe();
  }

  private async loadChangelogs() {
    if(this.sharedData.employeeDetails.administrator){
      await Promise.all(this.employees.map(async employee => {
        await new Promise(async resolve => {
          this.dataLoaded = false;
          await this.effectivenessService.getEffectivenessChangelog(employee.documentId,
            Timestamp.fromDate(this.datesForm.value.dateFrom), Timestamp.fromDate(this.datesForm.value.dateTo))
            .subscribe(changelog => {
              const index = this.effectivenessAllEmployees.findIndex(single => single.employee.documentId === employee.documentId);
              const index2 = changelog.findIndex(single2 => single2 === undefined)
              if(index > -1 && index2 == -1) this.effectivenessAllEmployees[index].effectiveness = changelog;
              else if(index2 == -1) {
                this.effectivenessAllEmployees.push({
                  employee: employee,
                  effectiveness: changelog
                })
              }
              if(this.dataLoaded) this.setChart()
              resolve();
            })
        })
      })).then(() => {
        this.setChart();
      })
    }
    else {
      this.subscriber$ = this.effectivenessService.getEffectivenessChangelog(this.sharedData.employeeDetails.documentId,
        Timestamp.fromDate(this.datesForm.value.dateFrom), Timestamp.fromDate(this.datesForm.value.dateTo))
        .subscribe(changelog => {
          this.effectivenessAllEmployees = [];
          this.effectivenessAllEmployees.push({employee: this.sharedData.employeeDetails, effectiveness: changelog})
          this.setChart();
        })
    }
  }

  private setChart(): void {
    this.dataLoaded = false;

    this.chartData = [];
    this.chartLabel = [];
    let tmpLabels: Timestamp[] = [];

    this.effectivenessAllEmployees.forEach((singleChangelog, index) => {
      if(singleChangelog !== undefined) {
        singleChangelog.effectiveness.forEach(singleEffectiveness => {
          if(!tmpLabels.find(label => label.seconds === singleEffectiveness.date.seconds))
          tmpLabels.push(singleEffectiveness.date)
        })
      }
    })

    for(let i = 0; i < tmpLabels.length-1; i++) {
      for(let j = i + 1; j < tmpLabels.length; j++){
        if(tmpLabels[i] > tmpLabels[j]) [tmpLabels[i], tmpLabels[j]] = [tmpLabels[j], tmpLabels[i]];
      }
    }

    tmpLabels.forEach(singleLabel => this.chartLabel.push(formatDate(singleLabel.toDate(), 'LLL yyyy', 'pl-PL').toString()))

    this.effectivenessAllEmployees.forEach((singleChangelog, index) => {
      const redValue: string = this.randomColorValue();
      const greenValue: string = this.randomColorValue();
      const blueValue: string = this.randomColorValue();

      if(singleChangelog != undefined){
        const chartSet: ChartDataSets = {
          barThickness: 'flex',
          hidden: true,
          hideInLegendAndTooltip: true,
          data: [],
          showLine: true,
          label: singleChangelog.employee.name + ' ' + singleChangelog.employee.surname,
          fill: false,
          pointBackgroundColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',0.8)',
          borderJoinStyle: 'bevel',
          borderColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',0.6)',
          hoverBorderColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',0.6)',
          backgroundColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',1)',
          hoverBackgroundColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',1)',
          pointRadius: 4,
          pointHitRadius: 2,
          pointBorderWidth: 1,
          pointBorderColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',1)',
          pointHoverBorderColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',1)',
          pointHoverBackgroundColor: 'rgba(' + redValue + ',' + greenValue + ',' + blueValue + ',0.8)',
          pointHoverRadius: 6,
          lineTension: 0.5,
          borderWidth: 4,
        }

        let previousValue: number = null;
        let labelsIndex: number = 0;
        let effectivenessIndex: number = 0;
        while (labelsIndex < tmpLabels.length) {
          if (singleChangelog.effectiveness[effectivenessIndex] !== undefined &&
            singleChangelog.effectiveness[effectivenessIndex].date.seconds === tmpLabels[labelsIndex].seconds) {
            if(this.averageEffectiveness) {
              chartSet.data.push(singleChangelog.effectiveness[effectivenessIndex].average_score);
              previousValue = singleChangelog.effectiveness[effectivenessIndex].average_score;
            }
            else {
              chartSet.data.push(singleChangelog.effectiveness[effectivenessIndex].score);
              previousValue = singleChangelog.effectiveness[effectivenessIndex].score;
            }

            labelsIndex++;
            effectivenessIndex++;
          } else if(singleChangelog.effectiveness[effectivenessIndex] !== undefined ){
            chartSet.data.push(previousValue);
            labelsIndex++
          }
          else labelsIndex++;
        }

        this.chartData.push(chartSet);
      }
    })
    setTimeout(() => this.dataLoaded = true, 1);
  }

  private randomColorValue(): string {
    return (Math.floor(Math.random() * (Math.floor(200) - Math.ceil(0) + 1)) + Math.ceil(0)).toString()
  }

  private setMinDate(): void{
    this.minDate = this.datesForm.value.dateFrom;
  }

  private setMaxDate(): void{
    this.maxDate = this.datesForm.value.dateTo;
  }

  private reloadChart() {
    this.averageEffectiveness = !this.averageEffectiveness;
    if(this.chartType === 'line') {
      this.chartType = 'bar';
      this.chartOptions.title.text = 'Miesięczna skuteczność'
    }
    else {
      this.chartType = 'line';
      this.chartOptions.title.text = 'Średnia skuteczność'
    }
    this.setChart();
  }

}
