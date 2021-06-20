import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import {Subscription} from 'rxjs';
import {MessageModel} from '../../../../models/message.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {formatDate} from '@angular/common';
import {MatSlideToggleChange} from '@angular/material';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';

@Component({
  selector: 'one-work-conversation-content',
  templateUrl: './conversation-content.component.html',
  styleUrls: ['./conversation-content.component.scss']
})

export class ConversationContentComponent implements OnInit, OnDestroy {
  private conversation: MessageModel[] = [];
  @Input() receiverDocumentId: string;
  private receiver: EmployeeModel;
  private sender: EmployeeModel;
  private dataUpdate: boolean = false;

  private subscribeSentMessages$: Subscription;
  private subscribeReceivedMessages$: Subscription;
  private subscribeReceiver$: Subscription;
  private subscribeSender$: Subscription;
  private scrolling: boolean = true;
  private today: number = Math.floor(Timestamp.now().seconds / 86400);
  private yesterday: number = this.today - 1;
  private oneWeek: number = this.today - 7;
  private canScroll: boolean = false;

  constructor(private readonly messagesService: MessagesService,
              private readonly employeeService: EmployeeService,
              private readonly sharedData: SharedDataService) {

  }

  async ngOnInit() {
    await new Promise(resolve => {
      this.subscribeReceiver$ = this.employeeService.getEmployeeByDocumentId(this.receiverDocumentId).subscribe(receiver => {
        this.receiver = receiver;
        resolve();
      })
    })

    await new Promise(resolveSent => {
      this.subscribeSentMessages$ = this.messagesService.getSentMessages(this.receiver.documentId).subscribe(async sentMessages => {
        await new Promise(resolveReceived => {
          this.subscribeReceivedMessages$ = this.messagesService.getReceivedMessages(this.receiver.documentId).subscribe(async receivedMessages => {
            this.mergeMessages(sentMessages, receivedMessages);
            if(this.canScroll) this.scroll();
            resolveReceived();
          })
        })
        resolveSent();
      })
    })

    this.dataUpdate = true;

    setTimeout(() => {
      this.canScroll= true;
      this.scroll()
    }, 300);

    this.subscribeSender$ = this.employeeService.getEmployeeByDocumentId(this.sharedData.employeeDetails.documentId).subscribe(sender => {
      this.sender = sender;
    })

  }

  private mergeMessages(sentMessages: MessageModel [], receivedMessages: MessageModel[]): void {
    let sendIndex: number = 0;
    let receivedIndex: number = 0;
    let mainIndex: number = 0;

    while (mainIndex < (sentMessages.length + receivedMessages.length)) {

      let checkSendMessagesLength: boolean = sendIndex >= sentMessages.length;
      let checkReceivedMessagesLength: boolean = receivedIndex >= receivedMessages.length;

      if (!checkSendMessagesLength && (checkReceivedMessagesLength || (sentMessages[sendIndex].date < receivedMessages[receivedIndex].date))) {
        this.conversation[mainIndex] = sentMessages[sendIndex];
        this.conversation[mainIndex].senderOrReceiver = 'sender';
        sendIndex++;
      } else {
        this.conversation[mainIndex] = receivedMessages[receivedIndex];
        this.conversation[mainIndex].senderOrReceiver = 'receiver';
        receivedIndex++;
      }
      mainIndex++;
    }
  }

  protected isItAnotherDay(date1: Timestamp, date2: Timestamp): boolean {
    return (Math.floor(date2.seconds / 86400) - Math.floor(date1.seconds / 86400)) > 0;
  }

  protected establishDaysDifferance(date: Timestamp): number {
    const calculatedDay: number = Math.floor(date.seconds / 86400);
    if(calculatedDay < this.oneWeek) return -1;
    else if(calculatedDay < this.yesterday) return 0;
    else if(calculatedDay < this.today) return 1;
    else return 2;
  }

  protected setDateDisplay(date: Timestamp): string {
    const differance: number = this.establishDaysDifferance(date);
    switch (differance) {
      case -1:
        return formatDate(date.toDate(), 'd.LL.yyyy', 'pl-PL');

      case 0:
        return formatDate(date.toDate(), 'EEEE', 'pl-PL');

      case 1:
        return 'Wczoraj';

      case 2:
        return 'Dziś';

      default:
        return '';
    }
  }

  protected toggle(event: MatSlideToggleChange): void {
    this.scrolling = event.checked;
  }

  private scroll(): void {
    if(this.scrolling && document.getElementById('content') != undefined){
      document.getElementById('content').scroll({top: document.getElementById('content').scrollHeight, behavior: 'smooth'})
    }
  }

  ngOnDestroy() {
    if(this.subscribeSentMessages$ != undefined) this.subscribeSentMessages$.unsubscribe();
    if(this.subscribeReceivedMessages$ != undefined) this.subscribeReceivedMessages$.unsubscribe();
    if(this.subscribeReceiver$ != undefined) this.subscribeReceiver$.unsubscribe();
    if(this.subscribeSender$ != undefined) this.subscribeSender$.unsubscribe();
  }

}
