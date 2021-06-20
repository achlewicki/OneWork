import {Component, OnInit} from '@angular/core';
import {ProjectsService} from '../../../../services/projects-service/projects.service';
import {ProjectModel} from '../../../../models/project.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {TaskModel} from '../../../../models/task.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {MatDialog} from '@angular/material';
import {AddEditProjectComponent} from '../../dialogs/add-edit-project/add-edit-project.component';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';

@Component({
  selector: 'one-work-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})

export class ProjectsComponent implements OnInit {
  private projects: ProjectModel [] = [];
  private dataLoaded: boolean = false;
  private activeToggleButton: string = 'all';
  private widthsForScss: string[] = [];
  private todayDate = Timestamp.now();
  public singleProjectData: ProjectModel;
  private details: boolean = false;
  private globalIndex: number = -1;

  constructor(private readonly projectsService: ProjectsService,
              private readonly employeeService: EmployeeService,
              private readonly sharedData: SharedDataService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.projectsService.getProjects().subscribe((allProjects) => {
      allProjects.then(projects => {
        if(projects.length > 0){
          this.projects = projects.filter(Boolean)
          if(this.details) this.singleProjectData = projects.find(project => project.documentId === this.singleProjectData.documentId);
          this.projects.forEach(async (project, index) => {
            if(project != undefined) {
              project.decColor = this.convertColor(project.color)

              //Get members for project
              this.projectsService.getMembers(project.documentId).subscribe(async membersIds => {
                project.membersIds = membersIds;
                if (project.members === undefined) project.members = [];
                if (project.members != undefined) await project.members.splice(0, project.members.length);
                project.membersIds.forEach(memberId => {
                  this.employeeService.getEmployeeByDocumentId(memberId).subscribe(employee => {
                    const index2: number = project.members.findIndex(member => {
                      return member.documentId === employee.documentId
                    })
                    if (index2 > -1) project.members[index2] = employee;
                    else project.members.push(employee);
                  })
                })
              })

              //Get tasks for project
              await this.projectsService.getTasks(project.documentId).subscribe(tasks => {
                project.tasks = tasks;
                project.tasks.forEach(task => {
                  //Get employee for task
                  this.employeeService.getEmployeeByDocumentId(task.memberId).subscribe(employee => {
                    task.member = employee;
                  })
                  //Get subtasks for task
                  this.projectsService.getSubtasks(task.documentId, project.documentId).subscribe(subtasks => {
                    task.subtasks = subtasks;
                  });
                })
              })


              //Get Annotations for project
              this.projectsService.getAnnotations(project.documentId).subscribe(annotations => {
                project.annotations = annotations;
                // project.annotations = this.sortAnnotations(project.annotations);
                project.annotations.forEach(annotation => {
                  //Get employee for annotation
                  this.employeeService.getEmployeeByDocumentId(annotation.memberId).subscribe(employee => {
                    annotation.member = employee;
                  })
                })
              })
            }
          })
        }
     }).finally(() => {
          this.dataLoaded = true;
     });
   })
  }

  public calculateTotalFinished(tasks: TaskModel[], option: string, index?: number,): number {
    if(tasks === undefined || tasks.length === 0) return 0
    let total: number = 0;
    let finished: number = 0
    tasks.forEach(task => {
      total++;
      if(task.status === 'Zakończony') finished++;
    });

    switch(option) {
      case 'percentage':
        this.updateWidths(Math.round(finished / total * 100).toString(), index);
        return Math.round(finished / total * 100);

      case 'number':
        return finished;
    }


  }

  public updateWidths(tasksPercentage: string, index: number) {
    this.widthsForScss[index] = tasksPercentage + '%';
    let tmp: string = '';
    this.widthsForScss.forEach(width => tmp = tmp.concat(width));
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

  public setSingleProject(index: number): void {
    this.globalIndex = index;
    this.singleProjectData = this.projects[index];
    this.details = !this.details;
  }

  private addProject(): void {
    this.dialog.open(AddEditProjectComponent, {
      width: '900px',
      height: '1200px',
    })
  }

  public onToggleButtonClick(button: string): void {
    this.activeToggleButton = button;
  }
}
