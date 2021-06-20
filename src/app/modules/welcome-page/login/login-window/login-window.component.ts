import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthorizationService} from '../../../../services/authorization-service/authorization.service';
import {Router} from '@angular/router';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {LogsService} from '../../../../services/logs-service/logs.service';

@Component({
  selector: 'one-work-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss']
})

export class LoginWindowComponent implements OnInit {
  private loginForm: FormGroup;
  private errorInfo: string = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authorizationService: AuthorizationService,
    private readonly router: Router,
    private readonly employeeService: EmployeeService,
    private readonly logsService: LogsService,
    private readonly globalVariables: SharedDataService
  ) {

  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  private async submitEvent() {
    this.authorizationService.signIn(this.loginForm.value.email, this.loginForm.value.password).then(response => {
      if(response === 'auth/user-not-found' || response === 'auth/wrong-password') this.errorInfo = 'Błędny email i/lub hasło';
      else if(response != undefined) this.errorInfo = 'Nieznany błąd';
      else {
        this.employeeService.getEmployeeDetailsOnLoginOrRefresh().then(async () => {
          await this.logsService.createNewLog(this.globalVariables.employeeDetails.documentId).then(() => {
            this.router.navigateByUrl('/home')
          })
        });
      }
    })
  }

}
