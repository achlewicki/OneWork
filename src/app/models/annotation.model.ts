import {EmployeeModel} from './employee.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface AnnotationModel {
  documentId?: string,
  date: Timestamp,
  memberId?: string,
  member?: EmployeeModel,
  description: string
}
