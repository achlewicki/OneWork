import { Component, OnInit } from '@angular/core';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import {MessageModel} from '../../../../models/message.model';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {ConversationGroupModel} from '../../../../models/conversationGroup.model';

@Component({
  selector: 'one-work-messages-view',
  templateUrl: './messages-view.component.html',
  styleUrls: ['./messages-view.component.scss'],
})
export class MessagesViewComponent implements OnInit {
  private showConversation: boolean;
  private showGroupConversations: boolean;
  private receiverId: string;
  private groupId: string;
  private selectedGroup: ConversationGroupModel;
  private messageForm: FormGroup;
  private clickedReceiver: boolean = false;

  constructor(private readonly messagesService: MessagesService,
              private readonly formBuilder: FormBuilder,
              private readonly router: ActivatedRoute,
              private readonly sharedData: SharedDataService) {
    this.messageForm = this.formBuilder.group({
      content: ['', [Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    if(this.sharedData.getReceiver() != null){
      this.receiverId = this.sharedData.getReceiver();
      this.clickedReceiver = true;
      this.sharedData.setReceiver(null);
    }
  }

  private sendNewMessage(): void {
    if(this.showConversation) {
      let newMessage: MessageModel = {
        content: this.messageForm.value.content,
        date: Timestamp.now()
      }
      this.messagesService.createNewMessage(newMessage, this.receiverId)
      this.messageForm.reset();
    }

    else if(this.showGroupConversations) {
      let newMessage = {
        content: this.messageForm.value.content,
        date: Timestamp.now(),
        sender: this.sharedData.employeeDetails.documentId
      }
      this.messagesService.createNewGroupMessage(this.selectedGroup.documentId, newMessage)
      this.messageForm.reset();
    }
  }

  private setReceiver(receiver: string): void {
    this.showConversation = false;
    this.showGroupConversations = false;
    if(!this.clickedReceiver) this.receiverId = receiver;
    else this.clickedReceiver = false;
    setTimeout(() => {this.showConversation = true}, 1);
  }

  private setGroup(group: ConversationGroupModel): void {
    this.showConversation = false;
    this.showGroupConversations = false;
    this.selectedGroup = group
    setTimeout(() => {this.showGroupConversations = true}, 1);
  }
}
