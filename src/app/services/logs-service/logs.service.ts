import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {LogModel} from '../../models/log.model';
import {map} from 'rxjs/operators';
import firebase from 'firebase';
import {SharedDataService} from '../_shared-data/shared-data.service';
import Timestamp = firebase.firestore.Timestamp;
import {EmployeeService} from '../employee-service/employee.service';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly sharedData: SharedDataService,
              private readonly employeeService: EmployeeService) { }

  public getLogs(employeeDocumentId: string, dateFrom?: Timestamp): Observable<LogModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('log_in', '>', dateFrom).orderBy('log_in', 'desc');
      return query;
    })
      .snapshotChanges().pipe(map(logs => {
        return logs.map(log => {
          let logData = log.payload.doc.data() as LogModel;
          logData.documentId = log.payload.doc.id;
          return logData
        })
      }))
  }

  private async checkForExistingActiveLogAndHandleIt(employeeDocumentId: string): Promise<any> {
    return await new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
        .get().subscribe(employee => {
          const activeLogDocumentId = employee.get('activeLogId') as string;
          if(activeLogDocumentId != '') {
            this.firestore.collection( this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs', ref => {
              let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
              query = query.orderBy('log_in', 'desc').limit(1);
              return query;
            }).get().subscribe(logToHandle => {
              logToHandle.forEach(singleLog => {
                const logData = singleLog.data() as LogModel;
                const logOutTime = Math.floor(logData.log_in.seconds + logData.sent_queries*logData.average_interval_time)
                this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs/' + singleLog.id)
                  .set({log_out: new Timestamp(logOutTime, 0)}, {merge: true}).then(() => {
                    this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
                      .set({activeLogId: ''}, {merge: true}).then(() => resolve())
                })
              })
            })
          }
          else resolve();
      })
    })
  }

  public async createNewLog(employeeDocumentId: string): Promise<any> {
    await this.checkForExistingActiveLogAndHandleIt(employeeDocumentId).then(async () => {
      return await new Promise(resolve => {
        this.firestore.collection(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs')
          .add({
            average_interval_time: 0,
            log_in: Timestamp.now(),
            log_out: Timestamp.now(),
            no_answers_total: 0,
            sent_queries: 0,
          }).then(async document => {
          await this.employeeService.setActiveLogId(employeeDocumentId, document.id).then(() => resolve())
        })
      })
    })
  }

  public updateLog(employeeDocumentId: string, log: LogModel, logDocumentId: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs/' + logDocumentId)
      .set(log, {merge: true})
  }

  public async closeLog(employeeDocumentId: string, logDocumentId: string): Promise<any> {
    return await new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs/' + logDocumentId)
        .set({log_out: Timestamp.now()}, {merge: true}).then(() => resolve())
    })
  }

  public getLog(employeeDocumentId: string, logDocumentId: string): Observable<LogModel> {
    this.sharedData.employeeDetails.activeLogId;
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/logs/' + logDocumentId)
      .snapshotChanges().pipe(map(log => {
        return log.payload.data() as LogModel
      }))
  }
}
