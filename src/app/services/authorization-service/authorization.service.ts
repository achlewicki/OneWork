import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase';
import jwtDecode from 'jwt-decode';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(private readonly angularFireAuth: AngularFireAuth) { }

  public async signIn(email: string, password: string): Promise<any> {
    return await new Promise(resolve => {
      this.angularFireAuth.signInWithEmailAndPassword(email, password)
        .then(async response => {
          await response.user.getIdToken(true).then( async response => {
            await new Promise(async resolve1 => {
              await sessionStorage.setItem('token', JSON.stringify(response).slice(1, response.length+1));
              resolve1();
            }).then(() => resolve());
          });
        }).catch( error => resolve(error.code));
    })
  }

  public createUser(email: string, password: string): Promise<string> {
    return new Promise(resolve => {
      this.angularFireAuth.createUserWithEmailAndPassword(email, password)
        .then(response => {
          resolve(response.user.uid)
        }).catch(error => resolve(error.code));
    });
  }

  public async signOut(): Promise<any> {
    localStorage.removeItem('activeComponent');
    sessionStorage.removeItem('token');
    return await this.angularFireAuth.signOut();
  }

  public refreshToken() {
    const token = jwtDecode(sessionStorage.getItem('token'));
    //@ts-ignore
    const exp = token.exp as number;
    const dateNow: Timestamp = Timestamp.now();
    setTimeout(async () => {
      (await this.angularFireAuth.currentUser).getIdToken(true)
        .then(async response => {
          await sessionStorage.setItem('token', JSON.stringify(response).slice(1, response.length+1))
          this.refreshToken();
        });
    }, (exp - 10 - dateNow.seconds) * 1000)
  }

  public async verifyToken(token: string): Promise<boolean> {
    return await new Promise((resolve) => {
      this.angularFireAuth.idToken.subscribe(verifiedToken => {
        resolve(verifiedToken === token);
      })
    });
  }

  public async allowOrDenyChangesOnUser(email: string, password: string): Promise<any> {
    return await new Promise<any>(async resolve => {
      const credentials = firebase.auth.EmailAuthProvider.credential(email, password);
      await this.angularFireAuth.currentUser.then(user => user.reauthenticateWithCredential(credentials).then(async success => {
          await user.getIdToken(true).then(async response => await sessionStorage.setItem('token', JSON.stringify(response).slice(1, response.length+1)))
          resolve(true)
        }).catch(error => {
          resolve(error.code)
        })
       )
    })
  }

  public async updateEmail(newEmail: string): Promise<any> {
    return await new Promise<any>(async resolve => {
      await this.angularFireAuth.currentUser.then(user => user.updateEmail(newEmail).then(() => {
        resolve(true)
      }).catch(error => resolve(error.code)))
    })
  }

  public async updatePassword(newPassword: string): Promise<any> {
    return await new Promise<any>(resolve => {
      this.angularFireAuth.currentUser.then(user => user.updatePassword(newPassword).then(() => resolve(true)).catch(error => resolve(error.code)))
    })
  }
}
