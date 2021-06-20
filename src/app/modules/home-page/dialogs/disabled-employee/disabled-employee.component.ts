import { Component, OnInit } from '@angular/core';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {LogsService} from '../../../../services/logs-service/logs.service';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {AuthorizationService} from '../../../../services/authorization-service/authorization.service';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'one-work-disabled-employee',
  templateUrl: './disabled-employee.component.html',
  styleUrls: ['./disabled-employee.component.scss']
})
export class DisabledEmployeeComponent implements OnInit {
  constructor(private readonly matDialogRef: MatDialogRef<DisabledEmployeeComponent>,
              private readonly sharedData: SharedDataService,
              private readonly logsService: LogsService,
              private readonly employeeService: EmployeeService,
              private readonly authorization: AuthorizationService,
              private readonly snackBar: MatSnackBar,
              private readonly router: Router) { }

  ngOnInit() {
  }

  private logOut(): void {
    this.logsService.closeLog(this.sharedData.employeeDetails.documentId, this.sharedData.employeeDetails.activeLogId).then(() => {
      this.employeeService.setActiveLogId(this.sharedData.employeeDetails.documentId, '');
      this.authorization.signOut().then(() => {
        this.router.navigate(['/login']);
        this.snackBar.open('Wylogowano.', 'OK', {duration: 6000});
        this.sharedData.canCheckPresence = false;
        this.matDialogRef.close();
      }).catch(e => console.log(e))
    })
  }

}
