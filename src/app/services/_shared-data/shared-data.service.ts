import { Injectable } from '@angular/core';
import {EmployeeModel} from '../../models/employee.model';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  public employeeDetails: EmployeeModel;
  public employeeUID: string;
  private receiverId: string = null;
  public companyPath: string = 'test';
  public companyDocumentId: string;
  public canCheckPresence: boolean = true;

  constructor(private readonly router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.isEmployeeAdministrator();
  }

  public setReceiver(employeeDocumentId: string) {
    this.receiverId = employeeDocumentId;
  }

  public getReceiver(): string {
    return this.receiverId;
  }

  public async isEmployeeAdministrator(): Promise<boolean> {
    if(this.employeeDetails === undefined) return false;
    return new Promise<boolean>(resolve => resolve(this.employeeDetails.administrator))
  }
}
