import {EmployeeModel} from './employee.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {GroupMessagesModel} from './groupMessages.model';


export interface ConversationGroupModel {
  documentId?: string;
  name: string;
  created_by: string;
  created: Timestamp
  members?: EmployeeModel[]
  lastMessage?: GroupMessagesModel;
}
