import { Injectable } from '@angular/core';
import {AngularFireStorage} from '@angular/fire/storage';
import firebase from 'firebase';
import FullMetadata = firebase.storage.FullMetadata;
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SharedDataService} from '../_shared-data/shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private readonly storage: AngularFireStorage,
              private readonly sharedData: SharedDataService) { }

  public async getFiles(projectDocumentId: string): Promise<FullMetadata[]>{
    let files: any[] = [];
     return await new Promise(resolve => {
       this.storage.ref(this.sharedData.companyDocumentId + '/projects/' + projectDocumentId + '/').listAll().subscribe(list => {
         Promise.all(list.items.map(async item => {
           await item.getMetadata().then(meta => files.push(meta))
         })).then(() => resolve(files))
       });
     })
  }

  public async countFiles(projectDocumentId: string): Promise<number>{
    return await new Promise(resolve => {
      this.storage.ref(this.sharedData.companyDocumentId + '/projects/' + projectDocumentId + '/').listAll().subscribe(list => {
        resolve(list.items.length);
      });
    })
  }

  public async addFile(projectDocumentId: string, file: File, author: string): Promise<any> {
    return await this.storage.ref(this.sharedData.companyDocumentId + '/projects/' + projectDocumentId + '/' + file.name)
      .put(file, {customMetadata: {createdBy: author}}).percentageChanges().toPromise()
  }

  public async getDownloadUrl(filePath: string): Promise<string> {
    return await new Promise(resolve => this.storage.ref(filePath).getDownloadURL().subscribe(data => resolve(data)))
  }

  public getMetadata(filePath: string): Observable<FullMetadata> {
    return this.storage.ref(filePath).getMetadata().pipe(map(data => {
      return data
    }))
  }

  public deleteFile(filePath: string): Promise<any> {
    return this.storage.ref(filePath).delete().toPromise()
  }

  public editFile(filePath: string, file: File, author: string) {
    this.storage.upload(filePath, file, {customMetadata: {createdBy: author}})
  }
}
