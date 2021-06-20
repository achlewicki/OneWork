import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ProjectModel} from '../../models/project.model';
import {SharedDataService} from '../_shared-data/shared-data.service';
import {map} from 'rxjs/operators';
import {TaskModel} from '../../models/task.model';
import {EmployeeModel} from '../../models/employee.model';
import {AnnotationModel} from '../../models/annotation.model';
import {SubtaskModel} from '../../models/subtask.model';
import {Observable} from 'rxjs';
import {StatusesService} from '../statuses-service/statuses.service';
import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly globalVars: SharedDataService,
              private readonly statusesService: StatusesService,
              private readonly sharedData: SharedDataService) { }

   public getProjects(): Observable<Promise<ProjectModel []>> {
    return this.firestore.collection( this.sharedData.companyPath + 'projects', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('end_date', 'asc');
      return query;
    }).snapshotChanges().pipe(map(projects => {
      return Promise.all(projects.map(async project => {
        let projectData = project.payload.doc.data() as ProjectModel;
        projectData.statusId = project.payload.doc.data()['status'].id;
        projectData.documentId = project.payload.doc.id;
        let exist: boolean = false;

        await this.checkIfEmployeeExistsInProject(projectData.documentId).then(isExisting => {
          exist = isExisting
        });
        if(exist) {
          this.statusesService.getStatus(project.payload.doc.get('status').id)
            .subscribe(status => projectData.status = status);
          return projectData;
        } else {
          return
        }
      }))
    }))
  }

  private async checkIfEmployeeExistsInProject(projectDocumentId: string): Promise<boolean> {
    const memberDocRef = this.firestore.doc(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId).ref;
    let admin: boolean = false;
    await memberDocRef.get().then(object => admin = object.get('administrator'));
    return new Promise<boolean>(resolve => {
      this.firestore.collection( this.sharedData.companyPath + 'projects/' + projectDocumentId + '/members', ref => {
          let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          if(!admin) query = query.where('employee', '==', memberDocRef);
          return query;
        }).snapshotChanges().subscribe(res => resolve(res.length > 0))
    })
  }

  public getTasks(projectDocumentId: string): Observable<TaskModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks')
      .snapshotChanges().pipe(map(tasks => {
      return tasks.map(task => {
        let taskData = task.payload.doc.data() as TaskModel;

        taskData.documentId = task.payload.doc.id;
        taskData.memberId = task.payload.doc.get('member').id

        //Get status for task
        this.statusesService.getStatus(task.payload.doc.get('status').id)
          .subscribe(status => taskData.status = status);

        return taskData
      })
    }))
  }

  public getSubtasks(taskDocumentId: string, projectDocumentId: string): Observable<SubtaskModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks')
      .snapshotChanges().pipe(map(subtasks => {
        return subtasks.map(subtask => {
          let subtaskData = subtask.payload.doc.data() as SubtaskModel;
          subtaskData.documentId = subtask.payload.doc.id;

          //Get status for subtask
          this.statusesService.getStatus(subtask.payload.doc.get('status').id)
            .subscribe(status => subtaskData.status = status);
          return subtaskData;
        })
    }))
  }

  public getAnnotations(projectDocumentId: string): Observable<AnnotationModel []> {
    return this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/annotations', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date', 'asc');
      return query;
    })
      .snapshotChanges().pipe(map (annotations => {
      return annotations.map(annotation => {
        let annotationData = annotation.payload.doc.data() as AnnotationModel;
        annotationData.documentId = annotation.payload.doc.id;
        annotationData.memberId = annotation.payload.doc.get('member').id;
        return annotationData;
      })
    }))
  }

  public getMembers(projectDocumentId: string): Observable<string[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/members')
      .snapshotChanges().pipe(map(members => {
      return members.map(member => {
        // Get employee for project
        return member.payload.doc.get('employee').id
      })
    }))
  }

  public setStatusForTask(projectDocumentId: string, taskDocumentId: string, status: string): Promise<any> {
    return new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId)
        .set({status: this.firestore.doc('/statuses/' + status).ref}, {merge: true}).then(() => resolve())
    })
  }

  public setStatusForSubtask(projectDocumentId: string, taskDocumentId: string, subtaskDocumentId: string, status: string): Promise<any> {
    return new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks/' + subtaskDocumentId)
        .set({status: this.firestore.doc('/statuses/' + status).ref}, {merge: true}).then(() => resolve())
    })
  }

  public addNewAnnotation(projectDocumentId: string, annotation: AnnotationModel, employeeId: string): Promise<any> {
    return new Promise(resolve => {
      this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/annotations')
        .add({description: annotation.description, date: annotation.date, member: this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeId).ref})
        .then(() => resolve())
    })
  }

  public deleteAnnotation(projectDocumentId: string, annotationDocumentId: string): Promise<any> {
    return new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/annotations/' + annotationDocumentId)
        .delete().then(() => resolve())
    })
  }

  public async addNewProject(newProject: ProjectModel, status: string, members: EmployeeModel []): Promise<string> {
    return await this.firestore.collection(this.sharedData.companyPath + 'projects/')
      .add({
        title: newProject.title,
        description: newProject.description,
        color: newProject.color,
        end_date: newProject.end_date,
        start_date: newProject.start_date,
        status: this.firestore.doc('/statuses/' + status).ref
      }).then(documentInfo => {
        members.forEach(member => {
          this.firestore.collection(this.sharedData.companyPath + 'projects/' + documentInfo.id + '/members/')
            .add({employee: this.firestore.doc(this.sharedData.companyPath + 'employees/' + member.documentId).ref})
        })
        return documentInfo.id
      })
  }

  public updateProject(project: ProjectModel, status: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'projects/' + project.documentId)
      .set({
        title: project.title,
        description: project.description,
        color: project.color,
        end_date: project.end_date,
        start_date: project.start_date,
        status: this.firestore.doc('/statuses/' + status).ref
      }, {merge: true})
  }

  public deleteProject(projectDocumentId: string): Promise<any> {
    const path: string = this.sharedData.companyPath + 'projects/' + projectDocumentId;

    // Delete All Annotations
    this.firestore.collection(path + '/annotations/')
      .get().subscribe(annotations => annotations.forEach(annotation => this.firestore.doc(path + '/annotations/' + annotation.id).delete()))

    // Delete All Members
    this.firestore.collection(path + '/members/')
      .get().subscribe(members => members.forEach(member => this.firestore.doc(path + '/members/' + member.id).delete()))

    // Delete All Tasks and Subtasks
    this.firestore.collection(path + '/tasks/')
      .get().subscribe(tasks => tasks.forEach(task => this.deleteTask(projectDocumentId, task.id)))

    return this.firestore.doc(path).delete();
  }

  public addMemberToProject(projectDocumentId: string, employeeId: string): Promise<any> {
    return this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/members/')
      .add({employee: this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeId).ref})
  }

  public removeMemberFromProject(projectDocumentId: string, employeeId: string): void {
     this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/members/', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('employee', '==', this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeId).ref);
      return query;
    }).get().subscribe(documents => documents.forEach(document => {
      this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/members/' + document.id).delete()
    }))
  }

  public async addNewTask(projectDocumentId: string, task: string, status: string, memberDocumentId: string): Promise<string> {
    return await this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/')
      .add({
        description: task,
        status: this.firestore.doc('/statuses/' + status).ref,
        member: this.firestore.doc(this.sharedData.companyPath + 'employees/' + memberDocumentId).ref
      }).then(documentInfo => { return documentInfo.id });
  }

  public updateTask(projectDocumentId: string, task: TaskModel, status: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + task.documentId)
      .set({
        description: task.description,
        member: this.firestore.doc(this.sharedData.companyPath + 'employees/' + task.member.documentId).ref,
        status: this.firestore.doc('/statuses/' + status).ref
      })
  }

  public deleteTask(projectDocumentId: string, taskDocumentId: string): Promise<any> {
    // Delete All Subtasks
    this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks')
      .get().subscribe(subtasks => subtasks.forEach(subtask => this.deleteSubtask(projectDocumentId, taskDocumentId, subtask.id)))
    return this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId).delete()
  }

  public async addNewSubtask(projectDocumentId: string, taskDocumentId: string, status: string, subtask: string): Promise<string> {
    return await this.firestore.collection(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks')
      .add({
        subtask_description: subtask,
        status: this.firestore.doc('/statuses/' + status).ref,
      }).then(documentInfo => { return documentInfo.id });
  }

  public updateSubtask(projectDocumentId: string, taskDocumentId: string, subtask: string,  status: string, subtaskDocumentId): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks/' + subtaskDocumentId)
      .set({
        subtask_description: subtask,
        status: this.firestore.doc('/statuses/' + status).ref
      })
  }

  public deleteSubtask(projectDocumentId: string, taskDocumentId: string, subtaskDocumentId: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'projects/' + projectDocumentId + '/tasks/' + taskDocumentId + '/subtasks/' + subtaskDocumentId).delete()
  }
}
