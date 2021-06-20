import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {LogModel} from '../../../../models/log.model';
import {LogsService} from '../../../../services/logs-service/logs.service';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {PlacesModel} from '../../../../models/places.model';
import {EmployeeModel} from '../../../../models/employee.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {ProjectModel} from '../../../../models/project.model';
import {ProjectsService} from '../../../../services/projects-service/projects.service';
import {faCalendarAlt, faClock} from '@fortawesome/free-regular-svg-icons';
import {FilesService} from '../../../../services/files-service/files.service';

@Component({
  selector: 'one-work-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private date: Date = new Date();
  private timer;
  private recentLogs: LogModel[];
  private today: Date = new Date;
  private today2: Timestamp = Timestamp.now();
  private fixedToday: Timestamp = Timestamp.fromDate(new Date(this.today.setHours(0,0,0,0)));
  private places: PlacesModel;
  private employees: EmployeeModel[];
  private projects: ProjectModel[];
  private projectsLoaded: boolean = false;
  private clockIcon = faClock;
  private calendarIcon = faCalendarAlt;
  private filesCounter: {
    projectDocumentId: string,
    numberOfFiles: number,
  } [] = []

  constructor(private readonly sharedData: SharedDataService,
              private readonly logsService: LogsService,
              private readonly employeeService: EmployeeService,
              private readonly projectsService: ProjectsService,
              private readonly filesService: FilesService) { }

  ngOnInit() {
    this.timer = setInterval(() => this.date = new Date(), 1000);
    this.logsService.getLogs(this.sharedData.employeeDetails.documentId, this.fixedToday).subscribe(logs => {
      this.recentLogs = logs;
    })

    this.employeeService.getAllEmployees().subscribe(employees => {
      this.employees = employees;
      this.setPlaces();
    })

    this.projectsService.getProjects().subscribe(response => response.then(projects => {
      this.projects = projects.filter(Boolean);
      this.projects.forEach(project => this.filesService.countFiles(project.documentId).then(number => {
        project.decColor = this.convertColor(project.color)
        const index: number = this.filesCounter.findIndex(singleProject => singleProject.projectDocumentId === project.documentId)
        if(index > -1) this.filesCounter[index] = {projectDocumentId: project.documentId, numberOfFiles: number};
        else this.filesCounter.push({projectDocumentId: project.documentId, numberOfFiles: number});
      }))
    }).finally(() => this.projectsLoaded = true))
  }

  private setPlaces(): void {
    const numberOfEmployees: number = this.employees.length
    const employeeIndex: number = this.employees.findIndex(employee => employee.documentId === this.sharedData.employeeDetails.documentId);

    let effectivenessCounter: number = 1;
    let top3Counter: number = 1;
    let top10Counter: number = 1;
    let downInRowCounter: number = 1;

    for(let j = 0; j < numberOfEmployees; j++) {
      if(employeeIndex != j) {
        if(this.employees[employeeIndex].current_avg_effectiveness < this.employees[j].current_avg_effectiveness) effectivenessCounter++;
        if(this.employees[employeeIndex].top3 < this.employees[j].top3) top3Counter++;
        if(this.employees[employeeIndex].top10 < this.employees[j].top10) top10Counter++;
        if(this.employees[employeeIndex].bottommost < this.employees[j].bottommost) downInRowCounter++;
      }
    }

    this.places = {
      effectivenessPlace: effectivenessCounter,
      top3Place: top3Counter,
      top10Place: top10Counter,
      bottommostPlace: downInRowCounter,
      employeeDocumentId: this.employees[employeeIndex].documentId}
  }

  private findNumberOfFiles(projectDocumentId: string): number {
    const index: number =this.filesCounter.findIndex(singleProject => singleProject.projectDocumentId === projectDocumentId)
    if(index > -1) return this.filesCounter[index].numberOfFiles
  }

  public convertColor(hexColor: string): string[] {
    hexColor = hexColor.slice(1, 7);
    let decimalColor: string[] = [];
    decimalColor[0] = parseInt(hexColor.slice(0, 2), 16).toString();
    decimalColor[1] = parseInt(hexColor.slice(2, 4), 16).toString();
    decimalColor[2] = parseInt(hexColor.slice(4, 6), 16).toString();
    return decimalColor;
  }

  public calculateDeadlineDays(seconds: number): string {
    const days: string = Math.floor(seconds / (3600*24)).toString();
    return days !== '1' ? days + ' dni' : days + ' dzień';
  }


  ngOnDestroy() {
    clearInterval(this.timer);
  }

}
