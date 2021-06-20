import {EmployeeModel} from './employee.model';
import {TaskModel} from './task.model';
import {AnnotationModel} from './annotation.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export interface ProjectModel {
  documentId?: string;
  color: string,
  decColor?: string[],
  description: string,
  title: string,
  end_date: Timestamp,
  priority?: number,
  start_date: Timestamp,
  status?: string,
  statusId?: string,
  membersIds?: string [],
  members?: EmployeeModel[],
  tasks?: TaskModel[],
  annotations?: AnnotationModel[],
  percentage?: string,
}
