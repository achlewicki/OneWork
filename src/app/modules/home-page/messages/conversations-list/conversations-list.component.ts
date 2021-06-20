import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MessageModel} from '../../../../models/message.model';
import {EmployeeModel} from '../../../../models/employee.model';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {formatDate} from '@angular/common';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'one-work-conversations-list',
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.scss']
})
export class ConversationsListComponent implements OnInit {
  @Output() private receiver = new EventEmitter<string>();
  private lastMessages: MessageModel [] = [];
  private dataUpdate: boolean = false;
  private receiverUpdate: boolean = false;
  private today: number = Math.floor(Timestamp.now().seconds / 86400);
  private yesterday: number = this.today - 1;
  private oneWeek: number = this.today - 7;
  private receivers: EmployeeModel[] = [];
  @Input() activeReceiverId: string;
  private receiversControl = new FormControl();
  private filteredOptions: Observable<string[]>;
  private options: string[];
  private visibleReceivers: string[] = [];
  private control: boolean = true;

  constructor(private readonly messagesService: MessagesService) { }

  ngOnInit() {
    this.messagesService.listReceivers().subscribe(async allReceivers => {
      this.dataUpdate = false;
      allReceivers = allReceivers.filter(Boolean);
      for(let index = 0; index < allReceivers.length; index++) {
        const indexTmp: number = await this.receivers.findIndex(receiver => receiver.documentId === allReceivers[index].documentId)
        if(indexTmp > -1) this.receivers[indexTmp] = allReceivers[index];
        else if(allReceivers[index] !== undefined && allReceivers[index] !== null) await this.receivers.push(allReceivers[index]);
        if(!this.receiverUpdate){
          await new Promise(resolveReceivedMessage => {
            this.messagesService.getLastReceivedMessage(allReceivers[index].documentId).subscribe(async receivedMessage => {
              await new Promise(resolveSentMessage => {
                this.messagesService.getLastSentMessage(allReceivers[index].documentId).subscribe(async sentMessage => {
                  this.control = true;
                  if(this.dataUpdate) {
                    let currentIndex: number;
                    if(receivedMessage != undefined) currentIndex = this.lastMessages.findIndex(msg => { return msg.receiverDocumentId === receivedMessage.receiverDocumentId});
                    else if(sentMessage != undefined) currentIndex = this.lastMessages.findIndex(msg => { return msg.receiverDocumentId === sentMessage.receiverDocumentId })
                    if(currentIndex > -1) {
                      if(receivedMessage === undefined && sentMessage != undefined) {
                          this.lastMessages[currentIndex] = sentMessage;
                          this.lastMessages[currentIndex].senderOrReceiver = 'sender';
                      } else if(sentMessage === undefined && receivedMessage != undefined){
                          this.lastMessages[currentIndex] = receivedMessage;
                          this.lastMessages[currentIndex].senderOrReceiver = 'receiver'
                      } else if(receivedMessage.date < sentMessage.date) {
                          this.lastMessages[currentIndex] = sentMessage;
                          this.lastMessages[currentIndex].senderOrReceiver = 'sender'
                      } else {
                          this.lastMessages[currentIndex] = receivedMessage;
                          this.lastMessages[currentIndex].senderOrReceiver = 'receiver'
                      }
                      this.sortMessages();
                      //nie dziala na Firefoxie
                      // this.updateLastMessages(sentMessage, receivedMessage, currentIndex);
                    }
                  } else if(receivedMessage == undefined && sentMessage == undefined) {
                    const data: MessageModel = {
                      content: '',
                      date: new Timestamp(0,0),
                      receiverDocumentId: allReceivers[index].documentId,
                      senderOrReceiver: 'none'
                    };
                    // data.senderOrReceiver = 'none'
                    this.lastMessages.push(data);
                  } else if(receivedMessage == undefined && sentMessage != undefined) {
                      const data: MessageModel = sentMessage;
                      data.senderOrReceiver = 'sender';
                      this.lastMessages.push(data);
                  } else if(receivedMessage != undefined && sentMessage == undefined){
                      const data: MessageModel = receivedMessage;
                      data.senderOrReceiver = 'receiver'
                      this.lastMessages.push(data);
                  } else if(receivedMessage.date < sentMessage.date) {
                      const data: MessageModel = sentMessage;
                      data.senderOrReceiver = 'sender'
                      this.lastMessages.push(data);
                  } else {
                      const data: MessageModel = receivedMessage;
                      data.senderOrReceiver = 'receiver'
                      this.lastMessages.push(data);
                  }
                  this.control = false;
                  resolveSentMessage();
                })
              })
              resolveReceivedMessage();
            })
          })
        }
      }

      this.options = [];
      this.receivers.forEach(receiver => this.options.push(receiver.name + ' ' + receiver.surname));
      this.visibleReceivers = this.options;
      this.filteredOptions = this.receiversControl.valueChanges.pipe(map(record => this._filter(record)))
      this.filteredOptions.subscribe(value => this.visibleReceivers = value);
      this.sortMessages();

      this.setReceiver(this.receivers[0]);
      this.dataUpdate = true;
      this.receiverUpdate = true;
      this.control = false;
    })
  }

  private _filter(value: string): string[] {
    const newValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(newValue))
  }

  private isContaing(receiver: string): boolean {
    return !!this.visibleReceivers.find(visibleGroupName => visibleGroupName === receiver)
  }

  public sortMessages(){
    let tmpMessages = this.lastMessages;
    const loops = tmpMessages.length;
    for(let index = 0; index < loops; index++) {
      for(let index2 = index+1; index2 < loops; index2++) {
        if(this.lastMessages[index].date < this.lastMessages[index2].date) {
          [this.lastMessages[index], this.lastMessages[index2]] = [this.lastMessages[index2], this.lastMessages[index]];
          [this.receivers[index], this.receivers[index2]] = [this.receivers[index2], this.receivers[index]];
        }
      }
    }
  }

  public setReceiver(receiver: EmployeeModel):void {
    if(receiver !== undefined) this.receiver.emit(receiver.documentId);
  }

  private establishDaysDifferance(date: Timestamp): number {
    const calculatedDay: number = Math.floor(date.seconds / 86400);
    if(calculatedDay < this.oneWeek) return -1;
    else if(calculatedDay < this.yesterday) return 0;
    else if(calculatedDay < this.today) return 1;
    else return 2;
  }

  private setDateDisplay(date: Timestamp): string {
    const differance: number = this.establishDaysDifferance(date);
    switch (differance) {
      case -1:
        return formatDate(date.toDate(), 'd.LL', 'pl-PL');

      case 0:
        return formatDate(date.toDate(), 'EE', 'pl-PL');

      case 1:
        return 'Wczoraj';

      case 2:
        return 'Dziś';

      default:
        return '';
    }
  }

  private updateLastMessages(sentMessage: MessageModel, receivedMessage: MessageModel, index?: number) {
    if(receivedMessage === undefined && sentMessage !== undefined) {
      if(index) {
        this.lastMessages[index] = sentMessage;
        this.lastMessages[index].senderOrReceiver = 'sender';
      } else {
        const data: MessageModel = sentMessage;
        data.senderOrReceiver = 'sender'
        this.lastMessages.push(data);
      }

    } else if(receivedMessage !== undefined && sentMessage === undefined){
      if(index) {
        this.lastMessages[index] = receivedMessage;
        this.lastMessages[index].senderOrReceiver = 'receiver'
      } else {
        const data: MessageModel = receivedMessage;
        data.senderOrReceiver = 'receiver'
        this.lastMessages.push(data);
      }

    } else if(receivedMessage === undefined && sentMessage === undefined) {
      const data: MessageModel = {
        content: '',
        date: new Timestamp(0,0)
      };
      data.senderOrReceiver = 'none'
      this.lastMessages.push(data);
    } else if(receivedMessage.date < sentMessage.date) {
      if(index) {
        this.lastMessages[index] = sentMessage;
        this.lastMessages[index].senderOrReceiver = 'sender'
      } else {
        const data: MessageModel = sentMessage;
        data.senderOrReceiver = 'sender'
        this.lastMessages.push(data);
      }

    } else {
      if(index){
        this.lastMessages[index] = receivedMessage;
        this.lastMessages[index].senderOrReceiver = 'receiver'
      } else {
        const data: MessageModel = receivedMessage;
        data.senderOrReceiver = 'receiver'
        this.lastMessages.push(data);
      }
    }

    // if(index) this.sortMessages();
  }

}
