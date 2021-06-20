import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesViewComponent } from './messages-view/messages-view.component';
import { ConversationContentComponent } from './conversation-content/conversation-content.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatTabsModule, MatTooltipModule} from '@angular/material';
import { GroupConversationContentComponent } from './group-conversation-content/group-conversation-content.component';
import { ConversationsListComponent } from './conversations-list/conversations-list.component';
import { GroupConversationsListComponent } from './group-conversations-list/group-conversations-list.component';
import {FlexModule} from '@angular/flex-layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AddEditConversationGroupComponent} from '../dialogs/add-edit-conversation-group/add-edit-conversation-group.component';



@NgModule({
  declarations: [MessagesViewComponent,
    ConversationContentComponent,
    GroupConversationContentComponent,
    ConversationsListComponent,
    GroupConversationsListComponent],

  imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatTabsModule,
      FlexModule,
      MatTooltipModule,
      MatSlideToggleModule,
      FontAwesomeModule
  ],

  entryComponents: [
    AddEditConversationGroupComponent
  ]
})
export class MessagesModule { }
