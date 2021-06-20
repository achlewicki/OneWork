import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LogsService} from '../../../../services/logs-service/logs.service';
import {Subscription} from 'rxjs';
import {LogModel} from '../../../../models/log.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'one-work-management-employee-logs',
  templateUrl: './management-employee-logs.component.html',
  styleUrls: ['./management-employee-logs.component.scss']
})

export class ManagementEmployeeLogsComponent implements OnInit, OnDestroy {
  @Input() private employeeId: string;
  private logsSubscriber$: Subscription;
  private logsData: LogModel [];
  private date: Date = new Date;
  private dateFrom: Timestamp = Timestamp.fromDate(new Date(this.date.setHours(0,0,0,0) - 604800000));

  constructor(private readonly logs: LogsService) { }

  ngOnInit() {
    this.loadLogs(false);
  }

  ngOnDestroy() {
    if(this.logsSubscriber$ != undefined) this.logsSubscriber$.unsubscribe();
  }

  private loadLogs(nextWeek: boolean): void {
    if(nextWeek) {
      this.dateFrom = new Timestamp(this.dateFrom.seconds - 604800000, 0);
    }
    this.logsSubscriber$ = this.logs.getLogs(this.employeeId, this.dateFrom).subscribe(data => {
      this.logsData = data;
    })
  }

  private calculatePercentage(sent: number, noAnswered: number): string {
    if(sent === 0) return '';
    return Math.floor(noAnswered/sent * 100).toString() + '%';
  }

  private isItAnotherDay(date1: Timestamp, date2: Timestamp): boolean {
    return (Math.floor(date2.seconds / 86400) - Math.floor(date1.seconds / 86400)) > 0;
  }

  private convertSecondsToMinutes(seconds: number): string {
    const minutes: number = Math.floor(seconds/60);
    seconds = seconds - (minutes * 60);
    return minutes + 'm ' + Math.floor(seconds) + 's';
  }

}
