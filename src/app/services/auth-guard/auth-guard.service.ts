import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {AuthorizationService} from '../authorization-service/authorization.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild{
  constructor(private readonly authorisationService: AuthorizationService,
              private readonly router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.checkEmployee();
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.canActivate(next, state);
  }


  async checkEmployee(): Promise<boolean> {
    if(!sessionStorage.getItem('token')) {
      await this.router.navigate(['/login'])
      return false;
    }
    else {
      const token: string = sessionStorage.getItem('token');
      try {
        let verifyResult = await this.authorisationService.verifyToken(token);
        if (!verifyResult) {
          await this.router.navigate(['/login'])
          sessionStorage.removeItem('token');
          if(localStorage.getItem('activeComponent')) localStorage.removeItem('activeComponent')
        }
        return verifyResult

      } catch (error) {
        console.log(error);
        sessionStorage.removeItem('token');
        if(localStorage.getItem('activeComponent')) localStorage.removeItem('activeComponent')
        await this.router.navigate(['/login'])
        return false
      }
    }
  }


}
