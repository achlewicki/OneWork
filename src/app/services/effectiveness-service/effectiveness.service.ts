import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {EffectivenessModel} from '../../models/effectiveness.model';
import {map} from 'rxjs/operators';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {SharedDataService} from '../_shared-data/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class EffectivenessService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly sharedData: SharedDataService) { }

  public getEffectivenessChangelog(employeeDocumentId: string, dateFrom: Timestamp, dateTo: Timestamp): Observable<EffectivenessModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/effectiveness_changelog', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('date', '>', dateFrom).where('date', '<', dateTo).orderBy('date', 'asc');
      return query;
    }).snapshotChanges().pipe(map(allEffectiveness => {
        return allEffectiveness.map(effectiveness => {
          let effectivenessData = effectiveness.payload.doc.data() as EffectivenessModel;
          effectivenessData.documentId = effectiveness.payload.doc.id;
          this.firestore.doc(this.sharedData.companyPath + 'employees/' + effectiveness.payload.doc.get('issued_by').id)
            .get().subscribe(issuer => {
              effectivenessData.issued_by = issuer.get('name') + ' ' + issuer.get('surname');
          })
          return effectivenessData
        })
      }))
  }

  public async addEffectivenessLog(employeeDocumentId: string, effectiveness: EffectivenessModel): Promise<any> {
    let averageScore: number = 0;
    await this.calculateAverageEffectiveness(employeeDocumentId, effectiveness.score).then(data => averageScore = data);
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/effectiveness_changelog')
      .add({
        date: effectiveness.date,
        score: effectiveness.score,
        average_score: averageScore,
        comment: effectiveness.comment,
        issued_by: this.firestore.doc(this.sharedData.companyPath + 'employees/' + localStorage.getItem('employeeDocumentId')).ref
      }).then(() => this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId).set({current_avg_effectiveness: averageScore}, {merge: true}))
      .catch(error => error.code);
  }

  private async calculateAverageEffectiveness(employeeDocumentId: string, newScore: number): Promise<number> {
    return await new Promise<any>(resolve => {
      this.firestore.collection(this.sharedData.companyPath + 'employees/' + employeeDocumentId + '/effectiveness_changelog').get().subscribe(data => {
        const numberOfLogs: number = data.docs.length;
        this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId).get().subscribe(employee => {
          let averageEffectiveness: number = Math.round(((employee.get('current_avg_effectiveness')*numberOfLogs + newScore) / (numberOfLogs + 1) + Number.EPSILON) * 100) / 100;
          resolve(averageEffectiveness);
        });
      })
    })
  }
}
