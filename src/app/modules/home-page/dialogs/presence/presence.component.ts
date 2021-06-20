import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'one-work-presence',
  templateUrl: './presence.component.html',
  styleUrls: ['./presence.component.scss']
})
export class PresenceComponent implements OnInit, OnDestroy {
  private timer;
  private leftTime: number = 60;


  constructor(private readonly matDialogRef: MatDialogRef<PresenceComponent>) {
    setTimeout(() => this.matDialogRef.close(false), 60000);
  }

  ngOnInit() {
    this.timer = setInterval(() => this.leftTime--, 1000)
  }

  private closeWithSucces(): void {
    this.matDialogRef.close(true);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
