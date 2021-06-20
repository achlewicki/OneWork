import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {MessageModel} from '../../models/message.model';
import {map} from 'rxjs/operators';
import firebase from 'firebase';
import {EmployeeModel} from '../../models/employee.model';
import {AngularFireStorage} from '@angular/fire/storage';
import {SharedDataService} from '../_shared-data/shared-data.service';
import {ConversationGroupModel} from '../../models/conversationGroup.model';
import {EmployeeService} from '../employee-service/employee.service';
import Timestamp = firebase.firestore.Timestamp;
import {GroupMessagesModel} from '../../models/groupMessages.model';

@Injectable({
  providedIn: 'root'
})

export class MessagesService {

  constructor(private readonly firestore: AngularFirestore,
              private readonly storage: AngularFireStorage,
              private readonly sharedData: SharedDataService,
              private readonly employeeService: EmployeeService) { }

  public listReceivers(): Observable<EmployeeModel []> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('uid', '!=', this.sharedData.employeeDetails.uid);
      return query;
    })
      .snapshotChanges().pipe(map(receivers => {
        return receivers.map(receiver => {
          let employeeData = receiver.payload.doc.data() as EmployeeModel;
          employeeData.documentId = receiver.payload.doc.id;
          this.storage.ref(this.sharedData.companyDocumentId + '/photos/' + employeeData.documentId + '.png')
            .getDownloadURL().subscribe(photo => employeeData.photoUrl = photo);
          return employeeData;
        })
      }))
  }

  public getLastReceivedMessage(receiverDocumentId: string): Observable<MessageModel> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + receiverDocumentId + '/conversations/'
            + this.sharedData.employeeDetails.documentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date', 'desc').limit(1);
      return query;
    })
      .snapshotChanges().pipe(map(message => {
        return message.map(message => {
          let messageData = message.payload.doc.data() as MessageModel;
          messageData.receiverDocumentId = receiverDocumentId;
          return messageData
        })[0]
      }))
  }

  public getLastSentMessage(receiverDocumentId: string): Observable<MessageModel> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId + '/conversations/'
            + receiverDocumentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date', 'desc').limit(1);
      return query;
    })
      .snapshotChanges().pipe(map(message => {
        return message.map(message => {
          let messageData = message.payload.doc.data() as MessageModel;
          messageData.receiverDocumentId = receiverDocumentId;
          return messageData
        })[0]
      }))
  }

  public getSentMessages(receiverDocumentId: string): Observable<MessageModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId + '/conversations/'
            + receiverDocumentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date');
      return query;
    })
      .snapshotChanges().pipe(map(messages => {
        return messages.map(message => {
          return message.payload.doc.data() as MessageModel
        })
      }))
  }

  public getReceivedMessages(receiverDocumentId: string): Observable<MessageModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'employees/' + receiverDocumentId + '/conversations/'
            + this.sharedData.employeeDetails.documentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date');
      return query;
    })
      .snapshotChanges().pipe(map(messages => {
        return messages.map(message => {
          return message.payload.doc.data() as MessageModel
        })
      }))
  }

  public createNewMessage(message: MessageModel, receiverDocumentId: string): Promise<any> {
    try {
      return this.firestore.collection(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId
              + '/conversations/' + receiverDocumentId + '/messages')
        .add(message).then(result => { if(result) return result });
    }
    catch (error) {
      console.log(error)
    }
  }

  public getGroups(): Observable<Promise<ConversationGroupModel[]>> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages')
      .snapshotChanges().pipe(map(groups => {
        return Promise.all(groups.map(async groups => {
          let groupData = groups.payload.doc.data() as ConversationGroupModel;
          groupData.documentId = groups.payload.doc.id;
          let exist: boolean = false;

          await this.checkIfEmployeeExistsInGroup(groupData.documentId).then(isExisting => {
            exist = isExisting
          });
          if(exist) {
            return groupData;
          } else {
            return
          }
      }))
    }))
  }

  public getGroup(groupDocumentId: string): Observable<ConversationGroupModel> {
    return this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId)
      .snapshotChanges().pipe(map(group => {
        let groupData = group.payload.data() as ConversationGroupModel;
        return groupData;
      }))
  }

  private async checkIfEmployeeExistsInGroup(groupDocumentId: string): Promise<boolean> {
    const memberDocRef = this.firestore.doc(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId).ref;
    return new Promise<boolean>(resolve => {
      this.firestore.collection( this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members', ref => {
        let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
        query = query.where('employee', '==', memberDocRef);
        return query;
      }).snapshotChanges().subscribe(res => resolve(res.length > 0))
    })
  }

  public getLastGroupMessage(groupDocumentId: string): Observable<GroupMessagesModel> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date', 'desc').limit(1);
      return query;
    }).snapshotChanges().pipe(map(messages => {
      return messages.map(message => {
        return message.payload.doc.data() as GroupMessagesModel;
      })[0]
    }))
  }

  public getMessagesForGroup(groupDocumentId: string, dateFrom?: Timestamp): Observable<GroupMessagesModel[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.orderBy('date', 'asc');
      return query;
    }).snapshotChanges().pipe(map(messages => {
        return messages.map(message => {
          return message.payload.doc.data() as GroupMessagesModel;
        })
      }))
  }

  public getMembersForGroup(groupDocumentId: string): Observable<Observable<EmployeeModel>[]> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members')
      .snapshotChanges().pipe(map(members => {
        return members.map(member => {
          if(member){
            return  this.employeeService.getEmployeeByDocumentId(member.payload.doc.get('employee').id)
          }
        })
      }))
  }

  public createNewGroupMessage(groupDocumentId: string, data: any): Promise<any> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages')
      .add(data)
  }

  public async checkForMoreGroupMessages(groupDocumentId: string): Promise<number> {
    return await new Promise<number>(resolve => {
      this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages')
        .get().subscribe(data => {
          let length: number = 0
          data.forEach(() => length++);
          resolve(length);
      })
    })
  }

  public addGroup(name: string): Promise<string> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/')
      .add({
        name: name,
        created: Timestamp.now(),
        created_by: this.sharedData.employeeDetails.documentId
      }).then(document => {
        this.firestore.collection(document.path + '/members')
          .add({
            employee: this.firestore.doc(this.sharedData.companyPath + 'employees/' + this.sharedData.employeeDetails.documentId).ref
          })
        return document.id
      })
  }

  public editGroupName(groupDocumentId: string, name: string): Promise<any> {
    return this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId).set({name: name}, {merge: true});
  }

  public addMemberToGroup(groupDocumentId: string, memberDocumentId: string): Promise<any> {
    return this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members').add({
      employee: this.firestore.doc(this.sharedData.companyPath + 'employees/' + memberDocumentId).ref
    })
  }

  public deleteMemberFromGroup(groupDocumentId: string, memberDocumentId: string): void {
    this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages/', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('sender', '==', memberDocumentId);
      return query;
    })
      .get().subscribe(messages => {
      messages.forEach(message => this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages/' + message.id).set({sender: 'removed'}, {merge: true}))
    })

    const employeeRef = this.firestore.doc(this.sharedData.companyPath + 'employees/' + memberDocumentId).ref

    this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members/', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      query = query.where('employee', '==', employeeRef);
      return query;
    }).get().subscribe(data =>
      data.forEach(single =>
        this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members/' + single.id).delete()))
  }

  public deleteGroup(groupDocumentId: string): Promise<any> {
    this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members').get().subscribe(members => {
      members.forEach(member => this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/members/' + member.id).delete())
    })

    this.firestore.collection(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages').get().subscribe(messages => {
      messages.forEach(message => this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId + '/messages/' + message.id).delete())
    })

    return this.firestore.doc(this.sharedData.companyPath + 'group_messages/' + groupDocumentId).delete();
  }


}
