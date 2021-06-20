import { Component, OnInit } from '@angular/core';
import {EmployeeModel} from '../../../../models/employee.model';
import {EmployeeService} from '../../../../services/employee-service/employee.service';

@Component({
  selector: 'one-work-top-ranking',
  templateUrl: './top-ranking.component.html',
  styleUrls: ['./top-ranking.component.scss']
})

export class TopRankingComponent implements OnInit {
  private employees: EmployeeModel[];
  private displayedColumns: string[] = ['position', 'employee', 'effectiveness', 'top3', 'top10', 'bottommost'];
  private sortMode: string = 'effectiveness';
  private displayData: boolean = false;

  constructor(private readonly employeeService: EmployeeService) { }

  ngOnInit() {
    this.employeeService.getAllEmployees().subscribe(allEmployees => {
      this.employees = allEmployees;
      this.displayData = true;
    })
  }

  private howManySameScore(index: number): number {
    let howMany: number = 0;
    switch (this.sortMode){
      case 'effectiveness':
        for(let i = index-1; i >= 0; i--)  {
          if(this.employees[i].current_avg_effectiveness === this.employees[index].current_avg_effectiveness) howMany++;
          else break
        }
        break;

      case 'top3':
        for(let i = index-1; i >= 0; i--)  {
          if(this.employees[i].top3 === this.employees[index].top3) howMany++;
          else break
        }
        break;

      case 'top10':
        for(let i = index-1; i >= 0; i--)  {
          if(this.employees[i].top10 === this.employees[index].top10) howMany++;
          else break
        }
        break;

      case 'down':
        for(let i = index-1; i >= 0; i--)  {
          if(this.employees[i].bottommost === this.employees[index].bottommost) howMany++;
          else break
        }
        break;
    }

    return howMany;
  }

  private sort(): void {
    this.displayData = false;
    switch (this.sortMode) {
      case 'effectiveness':
        for (let index = 0; index < this.employees.length; index++) {
          for (let index2 = index + 1; index2 < this.employees.length; index2++) {
            if (this.employees[index].current_avg_effectiveness < this.employees[index2].current_avg_effectiveness) {
              [this.employees[index], this.employees[index2]] = [this.employees[index2], this.employees[index]];
            }
          }
        }
        break;

      case 'top3':
        for (let index = 0; index < this.employees.length; index++) {
          for (let index2 = index + 1; index2 < this.employees.length; index2++) {
            if (this.employees[index].top3 < this.employees[index2].top3) {
              [this.employees[index], this.employees[index2]] = [this.employees[index2], this.employees[index]];
            }
          }
        }
        break;

      case 'top10':
        for (let index = 0; index < this.employees.length; index++) {
          for (let index2 = index + 1; index2 < this.employees.length; index2++) {
            if (this.employees[index].top10 < this.employees[index2].top10) {
              [this.employees[index], this.employees[index2]] = [this.employees[index2], this.employees[index]];
            }
          }
        }
        break;

      case 'down':
        for (let index = 0; index < this.employees.length; index++) {
          for (let index2 = index + 1; index2 < this.employees.length; index2++) {
            if (this.employees[index].bottommost < this.employees[index2].bottommost) {
              [this.employees[index], this.employees[index2]] = [this.employees[index2], this.employees[index]];
            }
          }
        }
        break;
    }

    setTimeout(() => this.displayData = true, 1);
  }
}
