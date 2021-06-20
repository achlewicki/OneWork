import { Component, OnInit } from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {PlacesModel} from '../../../../models/places.model';

@Component({
  selector: 'one-work-management-view',
  templateUrl: './management-view.component.html',
  styleUrls: ['./management-view.component.scss']
})

export class ManagementViewComponent implements OnInit {
  private selectedEmployee: EmployeeModel;
  private showData: boolean = false;
  private numberOfEmployees: number;
  private places: PlacesModel;

  constructor() { }

  ngOnInit() {}

  private setEmployee(event: any): void {
    this.showData = false;
    this.selectedEmployee = event;
    setTimeout(() => this.showData = true, 1);
  }

}
