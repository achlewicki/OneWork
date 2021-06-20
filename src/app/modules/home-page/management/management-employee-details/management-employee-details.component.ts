import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlacesModel} from '../../../../models/places.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {Subscription} from 'rxjs';
import {EffectivenessService} from '../../../../services/effectiveness-service/effectiveness.service';
import {EffectivenessModel} from '../../../../models/effectiveness.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {faEdit} from '@fortawesome/free-regular-svg-icons';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';

@Component({
  selector: 'one-work-management-employee-details',
  templateUrl: './management-employee-details.component.html',
  styleUrls: ['./management-employee-details.component.scss']
})

export class ManagementEmployeeDetailsComponent implements OnInit, OnDestroy {
  @Input() private employeeToManage: EmployeeModel;
  @Input() private places: PlacesModel;
  @Input() private numberOfEmployees: number;
  private employeeToEdit: FormGroup;
  private todayDate: Timestamp = Timestamp.now();
  private intership: string = '';
  private effectivenessSubscriber$: Subscription;
  private validMonths: Date [];
  private evaluationForm: FormGroup;
  private score: number = 5;
  private editIcon = faEdit;
  private addIcon = faPlus;
  private blockedCheck: boolean = false;
  private adminCheck: boolean = false;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly effectivenessService: EffectivenessService,
              private employeeService: EmployeeService,
              private readonly sharedData: SharedDataService
              ) { }

  ngOnInit() {
    this.employeeToEdit = this.formBuilder.group({
      name: [this.employeeToManage.name,[Validators.required]],
      surname: [this.employeeToManage.surname, [Validators.required]],
      phone: [this.employeeToManage.phone, [Validators.required]],
      address: this.formBuilder.group({
        zip_code: [this.employeeToManage.address.zip_code, [Validators.required]],
        street: [this.employeeToManage.address.street, [Validators.required]],
        state: [this.employeeToManage.address.state, [Validators.required]],
        city: [this.employeeToManage.address.city, [Validators.required]]
      }),
    })

    this.blockedCheck = !this.employeeToManage.valid;
    this.adminCheck = this.employeeToManage.administrator;

    this.calculateInternship();

    this.effectivenessSubscriber$ = this.effectivenessService.getEffectivenessChangelog(this.employeeToManage.documentId, this.employeeToManage.employed_since, this.todayDate)
      .subscribe(data => {

        this.setMonths();
        this.validMonths.forEach((month, index) => {
          const index2: number = data.findIndex(singleLog => singleLog.date.toDate().getFullYear()  === month.getFullYear() && singleLog.date.toDate().getMonth() === month.getMonth())
          if(index2 > -1) {
            this.validMonths.splice(index, 1, null);
          }
        })

        while(this.validMonths.findIndex(month => month === null) > -1) {
          this.validMonths.splice(this.validMonths.findIndex(month => month === null), 1);
        }

        this.evaluationForm = this.formBuilder.group({
          month: [this.validMonths[0], [Validators.required]],
          comment: [''],
        })
    })
  }

  ngOnDestroy() {
    if(this.effectivenessSubscriber$ != undefined) this.effectivenessSubscriber$.unsubscribe();
  }

  private addNewScore(): void {
    const effectiveness: EffectivenessModel = {
      date: this.evaluationForm.value.month,
      score: this.score,
      comment: this.evaluationForm.value.comment
    }

    this.effectivenessService.addEffectivenessLog(this.employeeToManage.documentId, effectiveness).then();
  }

  private editEmployee(): void {
    if(this.sharedData.employeeDetails.super_administrator ||
      (this.sharedData.employeeDetails.administrator && (this.sharedData.employeeDetails.documentId === this.employeeToManage.documentId || !this.employeeToManage.administrator))){
      const data: EmployeeModel = {
        name: this.employeeToEdit.value.name,
        surname: this.employeeToEdit.value.surname,
        phone: this.employeeToEdit.value.phone,
        address: {
          zip_code: this.employeeToEdit.get('address')['controls'].zip_code.value,
          city: this.employeeToEdit.get('address')['controls'].city.value,
          street: this.employeeToEdit.get('address')['controls'].street.value,
          state: this.employeeToEdit.get('address')['controls'].state.value
        }
      };

      this.employeeService.updateEmployee(data, this.employeeToManage.documentId)
    }
  }

  private setAdmin(): void {
    if(!this.employeeToManage.administrator && this.sharedData.employeeDetails.super_administrator)
      if(confirm('Uwaga, czy na pewno chcesz aby pracownik ' + this.employeeToManage.surname + ' ' + this.employeeToManage.surname + ' nabył prawa administratora?\n' +
                  'Każdy pracownik z uprawnieniami administratora może: \n -Dodawać, edytować i usuwać projekty\n -Edytować dane osobiste pracowników\n -Wystawiać oceny pracownikom' +
                  '\n -Przeglądać wykres średniej skuteczności wszystkich pracowników\n -BLOKOWAĆ i NADAWAĆ uprawnienia administratora innym pracownikom!!!\n' +
                  'Tej operacji NIE BĘDZIESZ MÓGŁ cofnąć.')){
        if(confirm('Czy na pewno chcesz kontynuować?')){
          this.employeeService.makeEmployeeAnAdmin(this.employeeToManage.documentId, true)
        }
        else setTimeout(() => this.adminCheck = false, 1);
      }
      else setTimeout(() => this.adminCheck = false, 1);

      else if(this.employeeToManage.administrator && this.sharedData.employeeDetails.super_administrator) {
        this.employeeService.makeEmployeeAnAdmin(this.employeeToManage.documentId, false)
    }
  }

  private changeNewStatus(): void {
    this.employeeService.setNewStatus(this.employeeToManage.documentId, !this.employeeToManage.new);
  }

  private setValidStatus(): void {
    if(this.employeeToManage.valid)
      if(confirm('Czy na pewno chcesz zablokować pracownika ' + this.employeeToManage.name + ' ' + this.employeeToManage.surname +
          '? Pracownik nie będzie mógł nic zrobić w aplikacji, ale aktywność pracownika będzie wciąż monitorowana.'))
        this.employeeService.setValidStatus(this.employeeToManage.documentId, false)
      else setTimeout(() => this.blockedCheck = false, 1);

    if(!this.employeeToManage.valid)
      if(confirm('Czy na pewno chcesz odblokować pracownika ' + this.employeeToManage.name + ' ' + this.employeeToManage.surname +'?'))
        this.employeeService.setValidStatus(this.employeeToManage.documentId, true)
      else setTimeout(() => this.blockedCheck = true, 1);
  }

  private calculateInternship(): void {
    this.intership = Math.floor((this.todayDate.seconds - this.employeeToManage.employed_since.seconds) / 60 / 60 / 24).toString(10) + ' dni';
  }

  private setMonths(): void {
    this.validMonths = [];
    const validMonth: Date = this.employeeToManage.employed_since.toDate().getDate() < 20 ?
      new Date(this.employeeToManage.employed_since.toDate().getFullYear(), this.employeeToManage.employed_since.toDate().getMonth(), 20) :
      (this.employeeToManage.employed_since.toDate().getMonth() < 11 ?
        new Date(this.employeeToManage.employed_since.toDate().getFullYear(), this.employeeToManage.employed_since.toDate().getMonth() + 1, 20) :
        new Date(this.employeeToManage.employed_since.toDate().getFullYear() + 1, 0, 20));

    const monthsDifferance: number = this.todayDate.toDate().getDate() < 20 ? (validMonth.getMonth() <= this.todayDate.toDate().getMonth() ?
      this.todayDate.toDate().getMonth() - validMonth.getMonth() : - (validMonth.getMonth() - this.todayDate.toDate().getMonth())) :
      (validMonth.getMonth() <= this.todayDate.toDate().getMonth() ?
        this.todayDate.toDate().getMonth() - validMonth.getMonth() + 1 : - (validMonth.getMonth() - this.todayDate.toDate().getMonth() - 1))

    const numberOfPeriods: number = (this.todayDate.toDate().getFullYear() - validMonth.getFullYear()) * 12 + monthsDifferance;

    for(let i = 0; i < numberOfPeriods; i++) {
      if(i > 0) {
        if(this.validMonths[i-1].getMonth() === 11) this.validMonths.push(new Date(this.validMonths[i-1].getFullYear() + 1, 0, 20))
        else this.validMonths.push(new Date(this.validMonths[i-1].getFullYear(), this.validMonths[i-1].getMonth() + 1, 20))
      }
      else this.validMonths.push(validMonth);
    }
  }

  private label(tick: number): number {
    return tick/2;
  }
}
