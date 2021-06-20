import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {EmployeeModel} from './employee.model';

export interface EffectivenessModel {
  score: number,
  date: Timestamp,
  issued_by?: string,
  comment?: string,
  documentId?: string,
  average_score?: number
}
