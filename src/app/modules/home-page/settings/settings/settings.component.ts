import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {AuthorizationService} from '../../../../services/authorization-service/authorization.service';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {AngularFireStorage} from '@angular/fire/storage';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {Router} from '@angular/router';
import {ErrorStateMatcher, MatSnackBar} from '@angular/material';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';

@Component({
  selector: 'one-work-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private editForm: FormGroup;
  private photoUrl: string;
  private errorInfo: string;
  private errorInfo2: string;
  private matcher = new MyErrorStateMatcher();

  constructor(private readonly formBuilder: FormBuilder,
              private readonly authorizationService: AuthorizationService,
              private readonly employeeService: EmployeeService,
              private readonly storage: AngularFireStorage,
              private readonly globalVariables: SharedDataService,
              private readonly router: Router,
              public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      currentEmail: ['', [Validators.required]],
      newEmail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      newPassword: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[#$@$!%*?&])[A-Za-z0-9\d$#@$!%*?&].{7,}')]],
      newPassword2: ['', [Validators.required]],
      currentPassword: ['', [Validators.required]],
    }, {validators: this.checkPasswords})

    this.storage.ref(this.globalVariables.companyDocumentId + '/photos/' + this.globalVariables.employeeDetails.documentId + '.png')
      .getDownloadURL().subscribe(photo => this.photoUrl = photo)
  }

  private checkPasswords(group: FormGroup) {
    const newPassword = group.controls.newPassword.value;
    const newPassword2 = group.controls.newPassword2.value;
    return newPassword === newPassword2 ? null : { notSame: true }
  }

  private async uploadPhoto(event: any) {
    this.errorInfo = '';
    const photo: File = event.target.files[0];
    if(photo.type ==='image/png') {
      await new Promise<any>(resolve => {
        resolve(this.storage.ref(this.globalVariables.companyDocumentId + '/photos/' + this.globalVariables.employeeDetails.documentId + '.png').put(photo, {
          customMetadata: {updated: Timestamp.now().toDate().toDateString()}
        }))
      }).then(response => {
        if(response._delegate.state === 'success')
          this.storage.ref(this.globalVariables.companyDocumentId + '/photos/' + this.globalVariables.employeeDetails.documentId + '.png')
            .getDownloadURL().subscribe(photo2 => this.photoUrl = photo2)
      })
    }
    else this.errorInfo = 'Nieprawidłowy format zdjęcia.'
  }

  private updateEmailAndOrPassword(): void {
    this.errorInfo2 = '';
    this.authorizationService.allowOrDenyChangesOnUser(this.editForm.value.currentEmail, this.editForm.value.currentPassword).then(result => {
      if(result === true) {
        if(this.editForm.get('newEmail').valid) {
          this.authorizationService.updateEmail(this.editForm.value.newEmail).then(result => {
            if(result === 'auth/email-already-in-use') this.errorInfo2 += 'Email na których chcesz zmienić jest już w użyciu.\n';
            else if(result === 'auth/invalid-email') this.errorInfo2 += 'Nieprawidłowy format nowego emailu.';
            else if(result === true) {
              this.editForm.get('currentEmail').setValue(this.editForm.value.newEmail);
              this.editForm.get('newEmail').setValue('');
              this.editForm.get('currentPassword').setValue('');
              this.snackBar.open('Email został zmieniony. Wylogowano ze względów bezpieczeństwa.', 'OK', {duration: 6000})
              sessionStorage.removeItem('token');
              localStorage.removeItem('activeComponent');
              this.router.navigate(['/login']);
            }
            else this.errorInfo2 = 'Nieznany błąd';
          })
        }
        if(this.editForm.get('newPassword').valid) {
          this.authorizationService.updatePassword(this.editForm.value.newPassword).then(result => {
            if(result === 'auth/weak-password') this.errorInfo2 += 'Hasło jest słabe. Hasło powinno składać się przynajmniej z 8 znaków, ' +
              'w tym z conajmniej 1 wielkiej liter, 1 małej litery, 1 cyfry i 1 znaku specjalnego\n'
            else if(result === true) {
              this.editForm.get('newPassword').setValue('');
              this.editForm.get('newPassword2').setValue('');
              this.snackBar.open('Hasło zostało zmienione. Wylogowano ze względów bezpieczeństwa.', 'OK', {duration: 6000})
              sessionStorage.removeItem('token');
              localStorage.removeItem('activeComponent');
              this.router.navigate(['/login']);
            }
          })
        }
      }
      else if(result === 'auth/wrong-password' || result === 'auth/user-mismatch') this.errorInfo2 = 'Błędny email i/lub hasło';
      else this.errorInfo2 = 'Nieznany błąd';
    });
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    return (invalidCtrl || invalidParent);
  }
}
