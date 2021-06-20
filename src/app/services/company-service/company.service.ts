import { Injectable } from '@angular/core';
import {RegistrationCodeModel} from '../../models/registrationCode.model';
import {Observable} from 'rxjs';
import {CompanyModel} from '../../models/company.model';
import {map} from 'rxjs/operators';
import firebase from 'firebase';
import {AngularFirestore} from '@angular/fire/firestore';
import Timestamp = firebase.firestore.Timestamp;
import {SharedDataService} from '../_shared-data/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly sharedData: SharedDataService) { }

  public getRegistrationCodeInfo(codeValue: string): Observable<RegistrationCodeModel[]> {
    return this.firestore.collectionGroup('registration_codes')
      .snapshotChanges().pipe(map(allCodes => {
        return allCodes.map(code => {
          let codeData = code.payload.doc.data() as RegistrationCodeModel;
          codeData.documentId = code.payload.doc.id;
          if(codeData.value == codeValue) {
            codeData.companyDocumentId = code.payload.doc.ref.path.slice(10,code.payload.doc.ref.path.indexOf('/', 10));
            return codeData;
          }
        })
      }))
  }

  public getAllRegistrationCodes(): Observable<RegistrationCodeModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'registration_codes')
      .snapshotChanges().pipe(map(registrationCodes => {
        return registrationCodes.map(singleCode => {
          let codeData = singleCode.payload.doc.data() as RegistrationCodeModel;
          codeData.documentId = singleCode.payload.doc.id;
          return codeData
        })
      }))
  }

  public getAllCodesValues(): Observable<string[]> {
    return this.firestore.collectionGroup('registration_codes')
      .snapshotChanges().pipe(map(allCodes => {
        return allCodes.map(singleCode => {
          return singleCode.payload.doc.get('value') as string
        })
      }))
  }

  public addNewRegistrationsCode(code: RegistrationCodeModel): Promise<any> {
    return this.firestore.collection(this.sharedData.companyPath + 'registration_codes')
      .add(code)
  }

  public deleteRegistrationCode(codeId: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'registration_codes/' + codeId).delete()
  }

  public updateRegistrationCode(code: RegistrationCodeModel, companyDocumentId: string): Promise<any> {
    return this.firestore.doc('companies/' + companyDocumentId + '/registration_codes/' + code.documentId)
      .set({
        remaining_number_of_times_to_use: code.remaining_number_of_times_to_use,
        valid: code.valid,
        last_use: Timestamp.now()
      }, { merge: true });
  }

  public getCompanyInfo(companyDocumentId?: string): Observable<CompanyModel> {
    if(companyDocumentId) {
      return this.firestore.doc<CompanyModel>('companies/' + companyDocumentId)
        .snapshotChanges().pipe(map(companyDetails => {
          let company = companyDetails.payload.data() as CompanyModel;
          company.documentId = companyDetails.payload.id;
          return {...company}
        }));
    }

    return this.firestore.doc<CompanyModel>(this.sharedData.companyPath)
      .snapshotChanges().pipe(map(companyDetails => {
        let company = companyDetails.payload.data() as CompanyModel;
        company.documentId = companyDetails.payload.id;
        return {...company}
      }));
  }

  public updateCompanyInfo(company: CompanyModel): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath).set(company, {merge: true});
  }
}
