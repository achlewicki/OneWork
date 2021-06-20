import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class StatusesService {

  constructor(private readonly firestore: AngularFirestore) { }

  public getStatus(documentId: string): Observable<string> {
    return this.firestore.doc('statuses/' + documentId)
      .snapshotChanges().pipe(map(status => {
      const statusData = status.payload.data()['status'] as string;
      return statusData;
    }))
  }

  public getAllStatuses(): Observable<string[]> {
    return this.firestore.collection('statuses/')
      .snapshotChanges().pipe(map(statuses => {
        return statuses.map(status => {
          return status.payload.doc.data()['status'] as string;
        })
      }))
  }
}
