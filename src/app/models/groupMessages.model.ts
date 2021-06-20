import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface GroupMessagesModel {
  sender: string;
  content: string;
  date: Timestamp
}
