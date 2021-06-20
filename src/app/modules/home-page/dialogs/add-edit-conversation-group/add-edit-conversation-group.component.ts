import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ConversationGroupModel} from '../../../../models/conversationGroup.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EmployeeModel} from '../../../../models/employee.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'one-work-add-edit-conversation-group',
  templateUrl: './add-edit-conversation-group.component.html',
  styleUrls: ['./add-edit-conversation-group.component.scss']
})
export class AddEditConversationGroupComponent implements OnInit {
  private groupForm: FormGroup;
  private newGroup: boolean = true;
  private employees: EmployeeModel[] = [];
  private members: EmployeeModel[] = [];
  private deleteicon = faTrash;
  private groupToEdit: ConversationGroupModel = {
    name: 'Brak',
    created_by: 'brak',
    created: Timestamp.now()
  };

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly employeeService: EmployeeService,
    private readonly messagesService: MessagesService,
    private readonly sharedData: SharedDataService,
    private readonly matDialogRef: MatDialogRef<AddEditConversationGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public groupData: ConversationGroupModel,
  ) {
  }

  ngOnInit() {
    this.newGroup = true;

    if (this.groupData) this.newGroup = false;

    if (this.newGroup) {
      this.groupForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.maxLength(30)]],
      })
    } else {
      this.groupToEdit = this.groupData;
      this.members = this.groupData.members;
      this.groupForm = this.formBuilder.group({
        name: [this.groupData.name, [Validators.required, Validators.maxLength(30)]],
      })
    }

    this.employeeService.getAllEmployees().subscribe(employees => {
      if (!this.newGroup)
        employees.forEach(employee => {
          if (!this.employees.find(employeeLocal => employeeLocal.documentId === employee.documentId) &&
            !this.groupData.members.find(member => member.documentId === employee.documentId))
            this.employees.push(employee)
        })
      else {
        this.employees = employees;
        const index: number = this.employees.findIndex(employee => employee.documentId === this.sharedData.employeeDetails.documentId);
        this.members.push(this.employees[index])
        this.employees.splice(index, 1);
      }
    })
  }

  private addEmployeeToLocalMembers(employee: EmployeeModel): void {
    if (!this.members.find(member => member.documentId === employee.documentId)) this.members.push(employee);
    const indexToRemove: number = this.employees.findIndex(employeeFromAll => employeeFromAll.documentId === employee.documentId);
    this.employees.splice(indexToRemove, 1);
  }

  private addEmployeeToMembers(employee: EmployeeModel): void {
    if(!this.newGroup) this.messagesService.addMemberToGroup(this.groupToEdit.documentId, employee.documentId);
    this.addEmployeeToLocalMembers(employee);
  }

  private removeMemberFromLocalMembers(employee: EmployeeModel): void {
    if(employee.documentId != this.sharedData.employeeDetails.documentId){
      if (!this.newGroup) {
        this.messagesService.deleteMemberFromGroup(this.groupData.documentId, employee.documentId);
        this.employees.push(employee);
        const indexToRemove: number = this.members.findIndex(member => member.documentId === employee.documentId);
        this.members.splice(indexToRemove, 1);
      } else {
        this.employees.push(employee);
        const indexToRemove: number = this.members.findIndex(member => member.documentId === employee.documentId);
        this.members.splice(indexToRemove, 1);
      }
    }
  }

  private addEditGroup(): void {
    if (this.newGroup) {
      this.messagesService.addGroup(this.groupForm.value.name).then(documentId => {
        this.groupToEdit.name = this.groupForm.value.name as string;
        this.groupToEdit.documentId = documentId;
        this.groupToEdit.members = this.members;
        this.newGroup = false;
      });
    }

    else this.messagesService.editGroupName(this.groupToEdit.documentId, this.groupForm.value.name);
  }

  private deleteGroup(): void {
    this.messagesService.deleteGroup(this.groupData.documentId);
    this.matDialogRef.close();
  }
}
