import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {CompanyModel} from '../../../models/company.model';
import {AuthorizationService} from '../../../services/authorization-service/authorization.service';
import {RegistrationCodeModel} from '../../../models/registrationCode.model';
import {CompanyService} from '../../../services/company-service/company.service';
import {EmployeeService} from '../../../services/employee-service/employee.service';
import {EmployeeModel} from '../../../models/employee.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {AngularFireStorage} from '@angular/fire/storage';
import {ErrorStateMatcher} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'one-work-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})

export class RegistrationComponent implements OnInit {
  private registrationForm: FormGroup;
  private codeForm: FormGroup;
  private companyInfo: CompanyModel;
  private codeInfo: RegistrationCodeModel;
  private expired: boolean;
  private todayDate: Date = new Date();
  private errorInfo: string = '';
  private codeError: string = '';
  private matcher = new MyErrorStateMatcher();

  constructor(private readonly formBuilder: FormBuilder,
              private readonly employeeService: EmployeeService,
              private readonly companyService: CompanyService,
              private readonly authorisationService: AuthorizationService,
              private readonly storage: AngularFireStorage,
              private readonly router: Router) {
  }

  ngOnInit() {
    this.codeForm = this.formBuilder.group({
      code: ['', Validators.required]
    });

    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      newPassword: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$@$!%*?&])[A-Za-z0-9\d$#@$!%*?&].{7,}')]],
      newPassword2: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: this.formBuilder.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zip_code: ['', [Validators.required]]
      })
    }, {validators: this.checkPasswords});

    this.expired = true;
  }

  private checkPasswords(group: FormGroup) {
    const newPassword = group.controls.newPassword.value;
    const newPassword2 = group.controls.newPassword2.value;
    return newPassword === newPassword2 ? null : { notSame: true }
  }

  private establishCompanyWithRegistrationCode(): void {
    this.companyService.getRegistrationCodeInfo(this.codeForm.value.code).subscribe(data => {
      this.codeInfo = data.find(singleCode => singleCode != undefined)
      if (this.codeInfo != undefined) {
        this.codeError = '';
        if(this.codeInfo.expires_after.toDate() > this.todayDate) this.expired = false;
        this.companyService.getCompanyInfo(this.codeInfo.companyDocumentId).subscribe(data2 => {
          this.companyInfo = data2;
        });
      }
      else this.codeError = 'Nieprawidłowy kod'
    });
  }

  private async createEmployee() {
    if(this.registrationForm.valid && this.codeInfo.valid && this.companyInfo.valid){
      await this.authorisationService.createUser(this.registrationForm.value.email, this.registrationForm.value.newPassword).then(response => {
        this.errorInfo = '';
        let canCreate: boolean = true;
        if(response === 'auth/email-already-in-use') {
          this.errorInfo = 'Podany email jest zajęty \n';
          canCreate = false;
        }
        if(response === 'auth/invalid-email') {
          this.errorInfo += 'Błędny email \n';
          canCreate = false;
        }
        if(response === 'auth/weak-password') {
          this.errorInfo += 'Hasło jest za słabe';
          canCreate = false;
        }

        if(canCreate) {
          const newEmployee: EmployeeModel = {
            name: this.registrationForm.value.name,
            surname: this.registrationForm.value.surname,
            phone: this.registrationForm.value.phone,
            address: {
              zip_code: this.registrationForm.get('address')['controls'].zip_code.value,
              city: this.registrationForm.get('address')['controls'].city.value,
              street: this.registrationForm.get('address')['controls'].street.value,
              state: this.registrationForm.get('address')['controls'].state.value
            },
            valid: true,
            new: true,
            administrator: false,
            super_administrator: false,
            employed_since: Timestamp.now(),
            current_avg_effectiveness: 0,
            top3: 0,
            top10: 0,
            bottommost: 0,
            uid: response,
            activeLogId: ''
          }


          this.employeeService.createEmployee(newEmployee, this.companyInfo.documentId)
            .then(employeeDocumentId => {
              let blob = null;
              let xhr = new XMLHttpRequest();
              xhr.open('GET', './assets/new-user-avatar.png');
              xhr.responseType = 'blob'
              let avatar: File;
              xhr.onload = () =>  {
                blob = xhr.response;
                avatar = new File([blob], employeeDocumentId + '.png', {type: 'image/png'});
                this.storage.ref(this.codeInfo.companyDocumentId + '/photos/' + employeeDocumentId + '.png',).put(avatar, {
                  customMetadata: {updated: Timestamp.now().toDate().toDateString()}
                })
              }
              xhr.send();

              let codeCopy: RegistrationCodeModel = this.codeInfo;
              codeCopy.remaining_number_of_times_to_use -= 1;
              if(codeCopy.remaining_number_of_times_to_use == 0) codeCopy.valid = false;
              this.companyService.updateRegistrationCode(codeCopy, this.companyInfo.documentId).then(() => this.router.navigate(['/login']));
            });
        }
      });
    }
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    return (invalidCtrl || invalidParent);
  }
}
