import { Component, OnInit } from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';

@Component({
  selector: 'one-work-rankings',
  templateUrl: './rankings-view.component.html',
  styleUrls: ['./rankings-view.component.scss']
})
export class RankingsViewComponent implements OnInit {
  private topRanking: boolean = false;
  private effectivenessChart: boolean = false;
  private projectsChart: boolean = false;
  private employees: EmployeeModel[];

  constructor(private employeeService: EmployeeService) { }

  async ngOnInit() {
    await new Promise(resolve => {
      this.employeeService.getAllEmployees().subscribe(data => {
        this.employees = data;
        resolve()
      });
    })
  }

}
