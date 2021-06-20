import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {PresenceComponent} from '../dialogs/presence/presence.component';
import {SharedDataService} from '../../../services/_shared-data/shared-data.service';
import {EmployeeService} from '../../../services/employee-service/employee.service';
import {LogModel} from '../../../models/log.model';
import {LogsService} from '../../../services/logs-service/logs.service';
import {AuthorizationService} from '../../../services/authorization-service/authorization.service';
import {DisabledEmployeeComponent} from '../dialogs/disabled-employee/disabled-employee.component';

@Component({
  selector: 'one-work-home-page-main',
  templateUrl: './home-page-main.component.html',
  styleUrls: ['./home-page-main.component.scss']
})

export class HomePageMainComponent implements OnInit {
  private timer: number;
  private employeeLoaded: boolean = false;
  private logInfo: LogModel;
  private valid: boolean = true;

  constructor(public dialog: MatDialog,
              private readonly sharedData: SharedDataService,
              private readonly employeeService: EmployeeService,
              private readonly logsService: LogsService,
              private readonly authorization: AuthorizationService) { }

  async ngOnInit() {
    this.employeeLoaded = false;
    if(sessionStorage.getItem('token')) await this.employeeService.getEmployeeDetailsOnLoginOrRefresh().then(() => {
      this.employeeLoaded = true;
      this.authorization.refreshToken();
      this.sharedData.canCheckPresence = true;
      if(this.sharedData.employeeDetails && this.sharedData.employeeDetails.valid != undefined) {
        this.valid = this.sharedData.employeeDetails.valid;
        if(!this.valid) this.dialog.open(DisabledEmployeeComponent, {
          width: '450px',
          height: '300px',
          disableClose: true,
          hasBackdrop: true
        });
      }

      this.logsService.getLog(this.sharedData.employeeDetails.documentId, this.sharedData.employeeDetails.activeLogId)
        .subscribe(log => this.logInfo = log)
    });

    this.setTimer();
    setTimeout(() =>  this.checkPresence(), this.timer*1000)
  }



  private checkPresence(): void {
    if(this.sharedData.canCheckPresence){
      this.dialog.open(PresenceComponent, {
        width: '500px',
        height: '300px',
        disableClose: true,
        panelClass: 'custom-dialog'
      }).afterClosed().subscribe(presence => {
        let logCopy: LogModel = this.logInfo;
        logCopy.average_interval_time = (logCopy.average_interval_time * logCopy.sent_queries + this.timer) / (logCopy.sent_queries + 1)
        logCopy.sent_queries++;
        if(!presence) logCopy.no_answers_total++;
        this.logsService.updateLog(this.sharedData.employeeDetails.documentId, logCopy, this.sharedData.employeeDetails.activeLogId)
        this.setTimer()
        setTimeout(() => this.checkPresence(), this.timer*1000)
      })
    }
  }

  private setTimer(): void {
    this.timer = Math.floor(Math.random() * (600 - 180 + 1) + 180);
  }
}
