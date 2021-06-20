import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface LogModel {
  documentId: string,
  log_in: Timestamp;
  log_out: Timestamp;
  no_answers_total: number;
  sent_queries: number;
  average_interval_time: number;
}
