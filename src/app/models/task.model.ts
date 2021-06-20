import {EmployeeModel} from './employee.model';
import {SubtaskModel} from './subtask.model';

export interface TaskModel {
  documentId: string,
  status: string,
  memberId?: string,
  description: string,
  member: EmployeeModel,
  subtasks?: SubtaskModel []
}
