import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ProjectModel} from '../../../../models/project.model';
import {EmployeeModel} from '../../../../models/employee.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {ProjectsService} from '../../../../services/projects-service/projects.service';
import {StatusesService} from '../../../../services/statuses-service/statuses.service';
import {TaskModel} from '../../../../models/task.model';
import {SubtaskModel} from '../../../../models/subtask.model';
import {faAngleDoubleDown, faEdit, faPlus, faTrashAlt} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'one-work-add-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})
export class AddEditProjectComponent implements OnInit {
  private projectToEdit: ProjectModel = {
    title: '',
    description: '',
    color: '#FFFFFF',
    end_date: Timestamp.now(),
    start_date: Timestamp.now(),
    status: '',
    tasks: [],
  };

  private employees: EmployeeModel [] = [];
  private members: EmployeeModel [] = [];
  private projectForm: FormGroup;
  private minDate: Date;
  private maxDate: Date;
  private isNewProject: boolean;
  private allStatuses: string[];
  private counter: number;
  private newTaskForm: FormGroup;
  private newSubtaskForm: FormGroup;
  private expands: boolean [] = [];
  private deleteIcon = faTrashAlt;
  private editIcon = faEdit;
  private addIcon = faPlus;
  private expandIcon = faAngleDoubleDown;

  constructor(
    private readonly matDialogRef: MatDialogRef<AddEditProjectComponent>,
    private readonly employeeService: EmployeeService,
    private readonly formBuilder: FormBuilder,
    private readonly projectService: ProjectsService,
    private readonly statusesService: StatusesService,
    @Inject(MAT_DIALOG_DATA) public projectData: ProjectModel,
  ) {  }

  async ngOnInit() {
    this.counter = 0;
    if(this.projectData !== null) {
      this.isNewProject = false;
      this.projectToEdit = this.projectData;
    } else this.isNewProject = true;

    this.projectForm = this.formBuilder.group({
      title: [this.projectToEdit.title, [Validators.required]],
      description: [this.projectToEdit.description, [Validators.required]],
      color: [this.projectToEdit.color, [Validators.required]],
      endDate: [this.projectToEdit.end_date.toDate(), [Validators.required]],
      startDate: [this.projectToEdit.start_date.toDate(), [Validators.required]],
      status: [this.projectToEdit.status, [Validators.required]],
      tasks: this.formBuilder.array([])
    })

    this.setMinDate();
    this.setMaxDate();

    this.projectToEdit.tasks.forEach((task,index) => {
      this.expands.push(false);
      const taskForm = this.projectForm.get('tasks') as FormArray;
      if(taskForm != undefined) {
        taskForm.push(this.addNewTaskToForm(task))
      }

      task.subtasks.forEach(subtask => {
        const subtaskForm = this.projectForm.get('tasks')['controls'][index].get('subtasks') as FormArray;
        if(subtaskForm != undefined)
          subtaskForm.push(this.addNewSubtaskToForm(subtask))
      })
    })

    this.newTaskForm = this.formBuilder.group({
      description: ['',  [Validators.required]],
      status: ['Aktywny',  [Validators.required]],
      memberId: ['',  [Validators.required]],
    })

    this.newSubtaskForm = this.formBuilder.group({
      subtask_description: ['',  [Validators.required]],
      status: ['Aktywny',  [Validators.required]],
      taskId: ['', [Validators.required]]
    })

    await new Promise(resolve => {
      this.employeeService.getAllEmployees().subscribe(employees => {
        this.counter++;
        if(!this.isNewProject && this.counter < 3) this.projectData.members.forEach(member => {this.addEmployeeToLocalMembers(member)})
        employees.forEach(employee => {
          if(!this.employees.find(employeeLocal => employeeLocal.documentId === employee.documentId) && !this.members.find(member => member.documentId === employee.documentId))
            this.employees.push(employee)
        })
        resolve();
      })
    })

    await new Promise(resolve => {
      this.statusesService.getAllStatuses().subscribe(statuses => {
        this.allStatuses = statuses;
        resolve();
      })
    })

    this.projectForm.markAsUntouched();
  }

  private addProject(): void {
    this.isNewProject = false;
    const newProject = {
      title: this.projectForm.value.title,
      description: this.projectForm.value.description,
      color: this.projectToEdit.color,
      end_date: Timestamp.fromDate(this.projectForm.value.endDate),
      start_date: Timestamp.fromDate(this.projectForm.value.startDate),
    }

    this.projectService.addNewProject(newProject, this.convertStatus(this.projectForm.value.status), this.members)
      .then(id => {
      this.projectToEdit = newProject;
      this.projectToEdit.tasks = [];
      this.projectToEdit.documentId = id;
    });

  }

  private updateProject(): void {
    this.projectToEdit.title = this.projectForm.value.title;
    this.projectToEdit.description = this.projectForm.value.description;
    this.projectToEdit.start_date = Timestamp.fromDate(this.projectForm.value.startDate);
    this.projectToEdit.color = this.projectForm.value.color;
    this.projectToEdit.end_date = Timestamp.fromDate(this.projectForm.value.endDate)
    this.projectForm.markAsUntouched();
    this.projectService.updateProject(this.projectToEdit, this.convertStatus(this.projectForm.value.status));
  }

  private deleteProject(): void {
    if(confirm('Czy napewno chcesz usunąć cały projekt?')) {
      this.projectService.deleteProject(this.projectToEdit.documentId)
      this.matDialogRef.close('deleted')
    }
  }

  private addTask(): void {
    this.projectService.addNewTask(this.projectToEdit.documentId, this.newTaskForm.value.description,
      this.convertStatus(this.newTaskForm.value.status), this.newTaskForm.value.memberId).then(taskDocumentId => {
        const newTask: TaskModel = {
          documentId: taskDocumentId,
          description: this.newTaskForm.value.description,
          status: this.newTaskForm.value.status,
          member: this.members.find(member => member.documentId === this.newTaskForm.value.memberId),
          subtasks: []
        }
        this.projectToEdit.tasks.push(newTask);
        const taskForm = this.projectForm.get('tasks') as FormArray;
        taskForm.push(this.addNewTaskToForm(newTask));
        this.newTaskForm.reset();
    })
  }

  private updateTask(taskId: string, taskIndex: number): void {
    const projectTasksIndex = this.projectToEdit.tasks.findIndex(task => task.documentId === taskId)
    this.projectToEdit.tasks[projectTasksIndex].description = this.projectForm.get('tasks')['controls'][taskIndex].value.description;
    this.projectToEdit.tasks[projectTasksIndex].status = this.projectForm.get('tasks')['controls'][taskIndex].value.status;
    this.projectToEdit.tasks[projectTasksIndex].member = this.members.find(member => member.documentId = this.projectForm.get('tasks')['controls'][taskIndex].value.memberId);
    this.projectService.updateTask(this.projectToEdit.documentId, this.projectToEdit.tasks[projectTasksIndex],
      this.convertStatus(this.projectForm.get('tasks')['controls'][taskIndex].value.status))
  }

  private deleteTask(taskId: string, index: number): void {
    if(this.projectToEdit.tasks[index].subtasks.length > 0) {
      if(confirm('To zadanie posiada conajmniej jedno podzadanie. Czy na pewno chcesz usunąć (pozadanie również zostanie usunięte)?')){
        this.projectService.deleteTask(this.projectToEdit.documentId, taskId);
        const index2= this.projectToEdit.tasks.findIndex(task => task.documentId === taskId)
        this.projectToEdit.tasks.splice(index2, 1);
        this.projectForm.get('tasks')['controls'].splice(index, 1)
        this.projectForm.get('tasks')['value'].splice(index, 1)
      }
    }
    else {
      this.projectService.deleteTask(this.projectToEdit.documentId, taskId);
      const index2= this.projectToEdit.tasks.findIndex(task => task.documentId === taskId)
      this.projectToEdit.tasks.splice(index2, 1);
      this.projectForm.get('tasks')['controls'].splice(index, 1)
      this.projectForm.get('tasks')['value'].splice(index, 1)
    }
  }

  private addSubtask(): void {
    this.projectService.addNewSubtask(this.projectToEdit.documentId, this.newSubtaskForm.value.taskId,
      this.convertStatus(this.newSubtaskForm.value.status), this.newSubtaskForm.value.subtask_description,).then(subtaskDocumentId => {
      const newSubtask: SubtaskModel = {
        documentId: subtaskDocumentId,
        subtask_description: this.newSubtaskForm.value.subtask_description,
        status: this.newSubtaskForm.value.status
      }
      const index = this.projectToEdit.tasks.findIndex(task => task.documentId === this.newSubtaskForm.value.taskId);
      if(index > -1) this.projectToEdit.tasks[index].subtasks.push(newSubtask)
      const index2 = this.projectForm.get('tasks')['value'].findIndex(task => task.documentId === this.newSubtaskForm.value.taskId);
      const subtaskForm = this.projectForm.get('tasks')['controls'][index2].get('subtasks') as FormArray;
      subtaskForm.push(this.addNewSubtaskToForm(newSubtask));
      this.newSubtaskForm.reset();
    })
  }

  private updateSubtask(taskId: string, taskIndex: number, subtaskId: string, subtaskIndex: number): void {
    const projectTasksIndex = this.projectToEdit.tasks.findIndex(task => task.documentId === taskId);
    const projectSubtaskIndex = this.projectToEdit.tasks[projectTasksIndex].subtasks.findIndex(subtask => subtask.documentId === subtaskId)

    this.projectToEdit.tasks[projectTasksIndex].subtasks[projectSubtaskIndex].subtask_description =
      this.projectForm.get('tasks')['controls'][taskIndex].get('subtasks')['controls'][subtaskIndex].value.subtask_description;

    this.projectToEdit.tasks[projectTasksIndex].subtasks[projectSubtaskIndex].status =
      this.projectForm.get('tasks')['controls'][taskIndex].get('subtasks')['controls'][subtaskIndex].value.status;

    this.projectService.updateSubtask(this.projectToEdit.documentId, taskId, this.projectToEdit.tasks[projectTasksIndex].subtasks[projectSubtaskIndex].subtask_description,
      this.convertStatus(this.projectToEdit.tasks[projectTasksIndex].subtasks[projectSubtaskIndex].status), subtaskId)
  }

  private deleteSubtask(taskId: string, taskIndex: number, subtaskId: string, subtaskIndex: number): void {
    this.projectService.deleteSubtask(this.projectToEdit.documentId, taskId, subtaskId);
    const index = this.projectToEdit.tasks.findIndex(task => task.documentId === taskId);
    const index2 = this.projectToEdit.tasks[index].subtasks.findIndex(subtask => subtask.documentId === subtaskId)
    this.projectToEdit.tasks[index].subtasks.splice(index2, 1);
    this.projectForm.get('tasks')['controls'][taskIndex].get('subtasks')['controls'].splice(subtaskIndex, 1)
    this.projectForm.get('tasks')['controls'][taskIndex].get('subtasks')['value'].splice(subtaskIndex, 1)
    this.projectForm.get('tasks')['value'][taskIndex].get('subtasks')['value'].splice(subtaskIndex, 1)
  }

  private addNewTaskToForm(task: TaskModel): FormGroup {
    return this.formBuilder.group({
      documentId: task.documentId,
      description: [task.description,  [Validators.required]],
      status: [task.status,  [Validators.required]],
      memberId: [task.member.documentId,  [Validators.required]],
      subtasks: this.formBuilder.array([])
    })
  }

  private addNewSubtaskToForm(subtask: SubtaskModel): FormGroup {
    return this.formBuilder.group({
      documentId: subtask.documentId,
      subtask_description: [subtask.subtask_description,  [Validators.required]],
      status: [subtask.status,  [Validators.required]],
    })
  }

  private setMinDate(): void{
    this.minDate = this.projectForm.value.startDate;
  }

  private setMaxDate(): void{
    this.maxDate = this.projectForm.value.endDate;
  }

  private addEmployeeToLocalMembers(employee: EmployeeModel): void {
    if(!this.members.find(member => member.documentId === employee.documentId)) this.members.push(employee);
    const indexToRemove: number = this.employees.findIndex(employeeFromAll => employeeFromAll.documentId === employee.documentId);
    this.employees.splice(indexToRemove, 1);
  }

  private addEmployeeToMembers(employee: EmployeeModel): void {
    if(!this.isNewProject) this.projectService.addMemberToProject(this.projectToEdit.documentId, employee.documentId);
    this.addEmployeeToLocalMembers(employee);
  }

  private removeMemberFromProject(employee: EmployeeModel): void {
    if (this.projectToEdit.tasks.find(task => task.member.documentId === employee.documentId)) {
      alert('Uczestnik ' + employee.name + ' ' + employee.surname + ' jest przypisany do conajmniej jednego zadania. Zmień wykonawcę zadania/zadań lub usuń zadanie/zadania' +
        ' do których przypisany jest ' + employee.name + ' ' + employee.surname + '.');
      return
    }
    else if(this.members.length === 1 && !this.isNewProject) {
      alert('Nie można usunąć jedynego uczestesnika projektu.');
      return
    }
    else if(!this.isNewProject) {
      this.projectService.removeMemberFromProject(this.projectToEdit.documentId, employee.documentId);
      this.employees.push(employee);
      const indexToRemove: number = this.members.findIndex(member => member.documentId === employee.documentId);
      this.members.splice(indexToRemove, 1);
    }
    else {
      this.employees.push(employee);
      const indexToRemove: number = this.members.findIndex(member => member.documentId === employee.documentId);
      this.members.splice(indexToRemove, 1);
    }
  }

  private convertStatus(status: string): string {
    switch (status) {

      case 'Aktywny':
        return '0';

      case 'Zakończony':
        return '1';

      case 'Zarchiwizowany':
        return '2'

      case 'Anulowany':
        return '3'

      case 'Nierozpoczęty':
        return '4'

      case 'Wstrzymany':
        return '5'
    }
  }
}
