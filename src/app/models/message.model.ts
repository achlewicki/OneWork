import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface MessageModel {
  receiverDocumentId?: string;
  content: string;
  date: Timestamp;
  senderOrReceiver?: string;
}
