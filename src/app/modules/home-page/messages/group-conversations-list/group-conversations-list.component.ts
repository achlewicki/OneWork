import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ConversationGroupModel} from '../../../../models/conversationGroup.model';
import {MessagesService} from '../../../../services/messages-service/messages.service';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import {SharedDataService} from '../../../../services/_shared-data/shared-data.service';
import {formatDate} from '@angular/common';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {faEdit} from '@fortawesome/free-regular-svg-icons';
import {MatDialog} from '@angular/material';
import {AddEditConversationGroupComponent} from '../../dialogs/add-edit-conversation-group/add-edit-conversation-group.component';

@Component({
  selector: 'one-work-group-conversations-list',
  templateUrl: './group-conversations-list.component.html',
  styleUrls: ['./group-conversations-list.component.scss']
})

export class GroupConversationsListComponent implements OnInit {
  private today: number = Math.floor(Timestamp.now().seconds / 86400);
  private yesterday: number = this.today - 1;
  private oneWeek: number = this.today - 7;
  private activeGroup: string;
  @Output() selectedGroup = new EventEmitter<ConversationGroupModel>();
  private groups: ConversationGroupModel[];
  private groupsControl = new FormControl();
  private filteredOptions: Observable<string[]>;
  private options: string[];
  private visibleGroups: string[] = [];
  private addGroupIcon = faPlusCircle;
  private editGroupIcon = faEdit;
  private dataLoaded: boolean = false;
  private dataSorting: boolean = false;

  constructor(private readonly messagesService: MessagesService,
              private readonly sharedData: SharedDataService,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.messagesService.getGroups().subscribe(promise => promise.then(data => {
      this.groups = []
      this.groups = data.filter(Boolean);
      this.options = [];

      if(this.groups && this.groups.length > 0){
        this.groups.forEach(group => this.options.push(group.name));
        this.visibleGroups = this.options;
        this.filteredOptions = this.groupsControl.valueChanges.pipe(map(record => this._filter(record)))
        this.filteredOptions.subscribe(value => this.visibleGroups = value);
        this.activeGroup = this.groups[0].documentId
        for(let i = 0; i < data.length; i++) {
          this.groups[i].members = [];
          this.messagesService.getLastGroupMessage(this.groups[i].documentId).subscribe(message => {
            this.groups[i].lastMessage = message;
          })

          this.messagesService.getMembersForGroup(this.groups[i].documentId).subscribe(members => {
            members.forEach(member => {
              member.subscribe(memberInfo => {
                const index: number = this.groups[i].members.findIndex(memberInGroup => {
                  if(memberInGroup) return memberInGroup.documentId === memberInfo.documentId
                })
                if(index > -1) this.groups[i].members[index] = memberInfo;
                else this.groups[i].members.push(memberInfo)
              })
            })
          })
        }
      }
    }))
  }

  private _filter(value: string): string[] {
    const newValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(newValue))
  }

  private isContaing(groupName: string): boolean {
    return !!this.visibleGroups.find(visibleGroupName => visibleGroupName === groupName)
  }

  private setGroup(group: ConversationGroupModel): void {
    this.activeGroup = group.documentId;
    this.selectedGroup.emit(group)
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

  private canCreateMoreGroups(): boolean {
    let createdGroups: number = 0;
    this.groups.forEach(group => {
      if(group.created_by == this.sharedData.employeeDetails.documentId) createdGroups++;
    })
    return createdGroups < 2;
  }

  private canManageGroup(groupDocumentId: string): boolean {
    return !!this.groups.find(group => group.documentId === groupDocumentId && group.created_by === this.sharedData.employeeDetails.documentId)
  }

  private createGroup(): void {
    this.dialog.open(AddEditConversationGroupComponent, {
      width: '700px',
    })
  }

  private editGroup(group: ConversationGroupModel): void {
    this.dialog.open(AddEditConversationGroupComponent, {
      data: group,
      width: '700px',
    })
  }
}
