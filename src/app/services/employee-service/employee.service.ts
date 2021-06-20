import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {EmployeeModel} from '../../models/employee.model';
import {map} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';
import firebase from 'firebase';
import jwtDecode from 'jwt-decode';
import {SharedDataService} from '../_shared-data/shared-data.service';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class EmployeeService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly storage: AngularFireStorage,
              private readonly sharedData: SharedDataService) { }

  public async getEmployeeDetailsOnLoginOrRefresh(): Promise<any> {
    const token = await jwtDecode(sessionStorage.getItem('token'));
    return await new Promise(resolve => {
      this.firestore.collection('companies').get().subscribe( companies => {
        companies.forEach(async singleCompany => {
          this.firestore.collection('companies/' + singleCompany.id + '/employees', ref => {
            let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
            // @ts-ignore
            query = query.where('uid', '==', token.user_id);
            return query;
          }).snapshotChanges().pipe(map(employeesDetails => {
            return employeesDetails.map(singleEmployeeDetails => {
              let data = singleEmployeeDetails.payload.doc.data() as EmployeeModel;
              data.documentId = singleEmployeeDetails.payload.doc.id;
              return data;
            })[0]
          })).subscribe(async employee => {
            if (employee != undefined) {
              this.sharedData.employeeDetails = employee;
              // @ts-ignore
              this.sharedData.employeeUID = await token.user_id;
              this.sharedData.companyPath = 'companies/' + singleCompany.id + '/';
              this.sharedData.companyDocumentId = singleCompany.id;
              resolve()
            }
          })
        });
      });
    })
  }

  public async setActiveLogId(employeeDocumentId: string, logDocumentId: string): Promise<any> {
    return await new Promise(resolve => {
      this.firestore.doc(this.sharedData.companyPath + 'employees/'  + employeeDocumentId)
        .set({activeLogId: logDocumentId}, {merge: true}).then(() => {
          this.sharedData.employeeDetails.activeLogId = logDocumentId;
          resolve()
      });
    })
  }

  public getEmployeeByDocumentId(employeeDocumentId: string): Observable<EmployeeModel> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .snapshotChanges().pipe(map( employee => {
        let employeeData = employee.payload.data() as EmployeeModel;
        employeeData.documentId = employee.payload.id;
        this.storage.ref(this.sharedData.companyDocumentId + '/photos/' + employeeDocumentId + '.png').getMetadata().subscribe(() => {
          this.storage.ref(this.sharedData.companyDocumentId + '/photos/' + employeeDocumentId + '.png').getDownloadURL().subscribe(photo => employeeData.photoUrl = photo);
        })
        return employeeData;
      }))
  }

  public getAllEmployees(): Observable<EmployeeModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('current_avg_effectiveness', 'desc');
      return query;
    }).snapshotChanges().pipe(map(employees => {
        return employees.map(employee => {
          let employeeData = employee.payload.doc.data() as EmployeeModel
          employeeData.documentId = employee.payload.doc.id;
          this.storage.ref(this.sharedData.companyDocumentId + '/photos/' + employeeData.documentId + '.png').getMetadata().subscribe(() => {
            this.storage.ref(this.sharedData.companyDocumentId + '/photos/'+ employeeData.documentId + '.png').getDownloadURL().subscribe(photo => employeeData.photoUrl = photo);
          })
          return employeeData
        })
      }))
  }

  public updateEmployee(employee: EmployeeModel, employeeDocumentId: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .set(employee, {merge: true});
  }

  public makeEmployeeAnAdmin(employeeDocumentId: string, admin: boolean): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .set({administrator: admin}, {merge: true});
  }

  public setNewStatus(employeeDocumentId: string, newStatus: boolean): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .set({new: newStatus}, {merge: true});
  }

  public setValidStatus(employeeDocumentId: string, valid: boolean): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .set({valid: valid}, {merge: true});
  }

  public createEmployee(newEmployee: EmployeeModel, companyDocumentId: string): Promise<any> {
      return new Promise(resolve => {
        this.firestore.collection('companies/' + companyDocumentId + '/employees')
          .add(newEmployee).then(data => resolve(data.id));
      })
  }

  public updatePlaces(employeeDocumentId: string, top3: number, top10: number, bottommost: number): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'employees/' + employeeDocumentId)
      .set({
        top3: top3,
        top10: top10,
        down_in_row: bottommost
      }, {merge: true});
  }
}
