import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ConversationGroupModel} from '../../../../models/conversationGroup.model';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {formatDate} from '@angular/common';
import {MatSlideToggleChange} from '@angular/material';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons';
import {GroupMessagesModel} from '../../../../models/groupMessages.model';

@Component({
  selector: 'one-work-group-conversation-content',
  templateUrl: './group-conversation-content.component.html',
  styleUrls: ['./group-conversation-content.component.scss']
})

export class GroupConversationContentComponent implements OnInit, OnDestroy {
  @Input() private selectedGroup: ConversationGroupModel;
  private groupMessages: GroupMessagesModel[];
  private groupMessagesSubscription$: Subscription;
  private groupMembersSubscription$: Subscription;
  private scrolling: boolean = true;
  private today: number = Math.floor(Timestamp.now().seconds / 86400);
  private yesterday: number = this.today - 1;
  private oneWeek: number = this.today - 7;
  private dateFrom: Timestamp = new Timestamp(Timestamp.now().seconds - 604800,  0)
  private loadMoreIcon = faRedoAlt;
  private thereIsMore: boolean = true;

  constructor(private readonly messagesService: MessagesService,
              private readonly sharedData: SharedDataService) {
  }

  ngOnInit() {
    this.groupMessagesSubscription$ = this.messagesService.getMessagesForGroup(this.selectedGroup.documentId).subscribe(data => {
      this.groupMessages = data//.filter(Boolean);
      this.scroll();
    })
  }

  ngOnDestroy() {
    if(this.groupMessagesSubscription$) this.groupMessagesSubscription$.unsubscribe();
    if(this.groupMembersSubscription$) this.groupMembersSubscription$.unsubscribe();
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

  private findMemberPhotoUrl(sender: string): string {
    return this.selectedGroup.members.find(member => member.documentId === sender).photoUrl
  }

  private findMemberNameAndSurname(sender: string): string {
    const index: number = this.selectedGroup.members.findIndex(member => member && member.documentId === sender)
    return this.selectedGroup.members[index].name + ' ' + this.selectedGroup.members[index].surname;
  }

  private loadMoreMessages(): void {
    this.scrolling = false;
    this.dateFrom = new Timestamp(this.dateFrom.seconds - 604800, 0);
    this.groupMessagesSubscription$ = this.messagesService.getMessagesForGroup(this.selectedGroup.documentId, this.dateFrom).subscribe(data => {
      if(data.length == this.groupMessages.length) {
        this.messagesService.checkForMoreGroupMessages(this.selectedGroup.documentId).then(length => {
          this.thereIsMore = length !== this.groupMessages.length;
        })
      }
      this.groupMessages = data;
    })
  }
}
