import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface RegistrationCodeModel {
  documentId?: string,
  value: string,
  companyDocumentId?: string,
  valid: boolean,
  expires_after: Timestamp,
  last_use?: Timestamp,
  remaining_number_of_times_to_use: number
}
