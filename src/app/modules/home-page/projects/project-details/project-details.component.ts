import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectModel} from '../../../../models/project.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {EmployeeModel} from '../../../../models/employee.model';
import {MatDialog, MatSlideToggleChange} from '@angular/material';
import {ProjectsService} from '../../../../services/projects-service/projects.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AnnotationModel} from '../../../../models/annotation.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {AddEditProjectComponent} from '../../dialogs/add-edit-project/add-edit-project.component';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {
  faArrowLeft,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileVideo, faFileImage, faFileCode, faFileAudio, faFileArchive, faFileCsv, faFile, faFileUpload
} from '@fortawesome/free-solid-svg-icons';
import {FilesService} from '../../../../services/files-service/files.service';
import FullMetadata = firebase.storage.FullMetadata;
import {faEdit, faTrashAlt,} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'one-work-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})

export class ProjectDetailsComponent implements OnInit {
  @Input() project: ProjectModel;
  @Input() totalFinishedTasks: number;
  @Output() details = new EventEmitter<boolean>();
  private tasksStatusChanged: string [] = []
  private subtasksStatusChanged: {
    taskId: string,
    subtasksIds: string []
  }[] = []
  private annotationForm: FormGroup;
  private deleteIcon = faTrashAlt;
  private returnIcon = faArrowLeft;
  private editIcon = faEdit;
  private todayDate = Timestamp.now();
  private projectFiles: {
    downloadUrl?: string,
    metadata: FullMetadata
  } [] = [];
  private pdfIcon = faFilePdf;
  private wordIcon = faFileWord;
  private powerpointIcon = faFilePowerpoint;
  private excelIcon = faFileExcel;
  private videoIcon = faFileVideo;
  private imageIcon = faFileImage;
  private codeIcon = faFileCode;
  private audioIcon = faFileAudio;
  private archiveIcon = faFileArchive;
  private csvIcon = faFileCsv;
  private fileIcon = faFile;
  private uploadIcon = faFileUpload;

  constructor(private readonly employeeService: EmployeeService,
              private readonly projectService: ProjectsService,
              private readonly formBuilder: FormBuilder,
              private readonly sharedData: SharedDataService,
              private readonly filesService: FilesService,
              public dialog: MatDialog) {
    this.annotationForm = this.formBuilder.group({
      description: ['', [Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.loadFiles();
  }

  private loadFiles(): void {
    this.filesService.getFiles(this.project.documentId).then(data => {
      this.projectFiles = [];
      data.forEach((singleFile, index) => {
        this.projectFiles.push({
          metadata: singleFile
        })
        this.setDownloadUrl(singleFile.fullPath, index);
      })
    })
  }

  private establishIconForFile(fileType: string, fileName: string): any {
    const generalType: string = fileType.substring(0, fileType.indexOf('/'))
    switch (generalType) {
      case 'video':
        return this.videoIcon

      case 'audio':
        return this.audioIcon

      case 'image':
        return this.imageIcon
    }

    const reversedFileName: string = fileName.split("").reverse().join("");
    const fileExtension: string = reversedFileName.substring(0, reversedFileName.indexOf('.')).split("").reverse().join("");

    switch (fileExtension) {
      case 'doc':
      case 'docx':
        return this.wordIcon

      case 'pdf':
        return this.pdfIcon

      case 'ppt':
      case 'pptx':
        return this.powerpointIcon

      case 'csv':
        return this.csvIcon

      case 'xls':
      case 'xlsx':
        return this.excelIcon

      case 'zip':
      case '7z':
      case 'rar':
      case 'tar':
      case 'gz':
        return this.archiveIcon

      case 'c':
      case 'cpp':
      case 'php':
      case 'js':
      case 'html':
      case 'xhtml':
      case 'htm':
      case 'xhtm':
      case 'sass':
      case 'scss':
      case 'ts':
        return this.codeIcon

      default:
        return this.fileIcon
    }
  }

  private establishAuthorForFile(file: FullMetadata): string {
    if(file.customMetadata != undefined){
      const memberIndex = this.project.members.findIndex(member => member.documentId === file.customMetadata.createdBy);
      if(memberIndex > -1) return this.project.members[memberIndex].name + ' ' + this.project.members[memberIndex].surname
    }
    return 'Autor nieznany';
  }

  private parseDate(date: string): Date {
    return new Date(Date.parse(date));
  }

  private setDownloadUrl(filePath: string, index: number): void {
    this.filesService.getDownloadUrl(filePath).then(data => this.projectFiles[index].downloadUrl = data);
  }

  private deleteFile(index: number): void {
    if(confirm('Czy na pewno chcesz usunąc plik ' + this.projectFiles[index].metadata.name + '?')){
      this.filesService.deleteFile(this.projectFiles[index].metadata.fullPath)
        .finally(() => this.projectFiles.splice(index, 1))
        .catch(error => console.log(error))
    }
  }

  private editFile(event: any, index: number): void {
    const file: File = event.target.files[0];
    this.filesService.editFile(this.projectFiles[index].metadata.fullPath, file, this.sharedData.employeeDetails.documentId);
    this.filesService.getMetadata(this.projectFiles[index].metadata.fullPath).subscribe(metadata => this.projectFiles[index].metadata = metadata)
    // event.target.files.splice(0, event.target.files.length);
  }

  private addFile(event: any): void {
    const file: File = event.target.files[0];
    this.filesService.addFile(this.project.documentId, file, this.sharedData.employeeDetails.documentId).then(() => this.loadFiles());
  }

  private doesEmployeeBelongsToProject(): boolean {
    return !!this.project.membersIds.find(memberId => memberId === this.sharedData.employeeDetails.documentId);
  }

  private setProgressBarWidth(): string{
    return Math.floor(this.totalFinishedTasks / this.project.tasks.length * 100).toString()+'%';
  }

  private setGradient(id: HTMLDivElement, id2?: HTMLDivElement): void {
    let id2Height = 1
    if(id2 != undefined) {
      id2Height = id2.clientHeight;
      id.style.background = 'linear-gradient(rgba(' + this.project.decColor[0] + ',' + this.project.decColor[1] + ',' + this.project.decColor[2] + ',' + (id2Height) / 1000 * 0.1 + '),' +
        'rgba(' + this.project.decColor[0] + ',' + this.project.decColor[1] + ',' + this.project.decColor[2] + ',' +  (id2Height - id.clientHeight) / 1000 * 0.1 + '))';
    }
    else {
      id.style.background = 'linear-gradient(rgba(' + this.project.decColor[0] + ',' + this.project.decColor[1] + ',' + this.project.decColor[2] + ',' + '0.1),' +
        'rgba(' + this.project.decColor[0] + ',' + this.project.decColor[1] + ',' + this.project.decColor[2] + ',' + (id.clientHeight) / 1000 * 0.1 + '))';
    }
  }

  private countTasksForMember(member: EmployeeModel, mode?: string): string{
    let totalFinished: number = 0;
    let totalTasks: number = 0;
    this.project.tasks.forEach(task => {
      if(task.memberId === member.documentId) {
        totalTasks++;
        if (task.status === 'Zakończony') totalFinished++;
      }});
    if(mode === 'all') return totalTasks.toString();
    return totalFinished.toString() + '/' + totalTasks.toString();
  }

  private setTasksStatusChanged(event: MatSlideToggleChange, id: string): void {
    if(!event.checked) this.tasksStatusChanged.splice(this.tasksStatusChanged.findIndex(task => task === id), 1);
    else this.tasksStatusChanged.push(id);
  }

  private setSubtasksStatusChanged(event: MatSlideToggleChange, taskId: string, subtaskId: string): void {
    const tmp: number = this.subtasksStatusChanged.findIndex(singleTaskForSubtasks => singleTaskForSubtasks.taskId === taskId);
    if(tmp > -1) {
      if(!event.checked) {
        this.subtasksStatusChanged[tmp].subtasksIds.splice(this.subtasksStatusChanged[tmp].subtasksIds.findIndex(subtask => subtask === subtaskId), 1);
        if(this.subtasksStatusChanged[tmp].subtasksIds.length === 0) this.subtasksStatusChanged.splice(tmp, 1);
      }
      else this.subtasksStatusChanged[tmp].subtasksIds.push(subtaskId);
    }
    else this.subtasksStatusChanged.push({taskId: taskId, subtasksIds: [subtaskId]})
  }

  private showDescriptionOfChangedTask(task: string): string {
    const desc: string = this.project.tasks.find(projectTask => projectTask.documentId === task).description
    return desc.slice(0, 10) + (desc.length > 10 ? '...' : '' );
  }

  private showDescriptionOfChangedSubtask(task: string, subtask: string): string {
    const desc: string = this.project.tasks.find(projectTask => projectTask.documentId === task).subtasks.find(taskSubtask => taskSubtask.documentId === subtask).subtask_description;
    return desc.slice(0, 10) + (desc.length > 10 ? '...' : '' );
  }

  private confirmChanges(): void {
    this.tasksStatusChanged.forEach(task => {
      this.projectService.setStatusForTask(this.project.documentId, task, '1').then(confirm => console.log(confirm))
    })
    this.tasksStatusChanged = [];

    this.subtasksStatusChanged.forEach(task => {
      for(let i = 0; i < task.subtasksIds.length; i++){
        this.projectService.setStatusForSubtask(this.project.documentId, task.taskId, task.subtasksIds[i], '1').then(confirm => console.log(confirm))
      }

      let totalUnfinishedSubtasks: number = 0;
      const projectTask = this.project.tasks.find(projectTask => projectTask.documentId === task.taskId)
      for(let i = 0; i < projectTask.subtasks.length; i++)
        if(projectTask.subtasks[i].status === 'Aktywny') totalUnfinishedSubtasks++;

      if(totalUnfinishedSubtasks === task.subtasksIds.length) this.projectService.setStatusForTask(this.project.documentId, task.taskId, '1');
    })
    this.subtasksStatusChanged = [];
  }

  private setNewAnnotation(): void {
    let newAnnotation: AnnotationModel = {
      description: this.annotationForm.value.description,
      date: Timestamp.now(),
    }

    this.projectService.addNewAnnotation(this.project.documentId, newAnnotation, this.sharedData.employeeDetails.documentId);
    this.annotationForm.reset()
  }

  private deleteAnnotation(annotationDocumentId: string): void {
    this.projectService.deleteAnnotation(this.project.documentId, annotationDocumentId);
  }

  private calculateDeadlineDays(seconds: number): string {
    const days: string = Math.floor(seconds / (3600*24)).toString();
    return days !== '1' ? days + ' dni' : days + ' dzień';
  }

  private calculatePercentage(): string {
    return Math.round(this.totalFinishedTasks / this.project.tasks.length * 100).toString() + '%'
  }

  private openEditProjectDialog(): void {
    this.dialog.open(AddEditProjectComponent, {
      data: this.project,
      width: '900px',
      height: '1200px',
      autoFocus: false
    }).afterClosed().subscribe(result => {
      if(result === 'deleted') {
        this.details.emit(false);
        this.project = undefined;
      }
    })
  }


}
