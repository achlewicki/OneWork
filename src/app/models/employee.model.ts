import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface EmployeeModel {
  documentId?: string,
  name: string;
  surname: string;
  mail?: string;
  address: {
    street: string,
    city: string,
    state: string,
    zip_code: string
  },
  phone: string,
  administrator?: boolean;
  super_administrator?: boolean;
  valid?: boolean;
  new?: boolean;
  employed_since?: Timestamp;
  current_avg_effectiveness?: number;
  bottommost?: number;
  top10?: number;
  top3?: number;
  photoUrl?: string;
  uid?: string;
  activeLogId?: string;
}
