import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {EmployeeService} from '../../../../services/employee-service/employee.service';
import {EmployeeModel} from '../../../../models/employee.model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PlacesModel} from '../../../../models/places.model';

@Component({
  selector: 'one-work-management-employees-list',
  templateUrl: './management-employees-list.component.html',
  styleUrls: ['./management-employees-list.component.scss']
})

export class ManagementEmployeesListComponent implements OnInit {
  private employees: EmployeeModel[];
  @Output() selectedEmployee = new EventEmitter<EmployeeModel>();
  @Output() numberOfEmployees = new EventEmitter<number>();
  @Output() places = new EventEmitter<PlacesModel>();
  private employeesControl = new FormControl();
  private placesAll: PlacesModel[];
  private filteredOptions: Observable<string[]>;
  private options: string[];
  private visibleEmployees: string[] = [];
  private activeId: string = null;
  private highestBottommost: number = 0;

  constructor(private readonly employeeService: EmployeeService) { }

  ngOnInit() {
    this.employeeService.getAllEmployees().subscribe(data => {
      this.employees = data;
      this.options = [];

      this.employees.forEach(employee => this.options.push(employee.name + ' ' + employee.surname));
      this.visibleEmployees = this.options;
      this.placesAll = [];
      this.setPlaces();
      if(this.activeId != null) {
        this.selectedEmployee.emit(data.find(singleEmployee => singleEmployee.documentId === this.activeId));
        this.places.emit(this.placesAll.find(places => places.employeeDocumentId === this.activeId));
      }

      this.filteredOptions = this.employeesControl.valueChanges.pipe(map(record => this._filter(record)))
      this.filteredOptions.subscribe(value => this.visibleEmployees = value);

      if(this.activeId === null) this.onSelectEmployee(this.employees[0])
    })
  }

  private setPlaces(): void {
    const numberOfEmployees: number = this.employees.length
    for(let i = 0; i < numberOfEmployees; i++) {
      let effectivenessCounter: number = 1;
      let top3Counter: number = 1;
      let top10Counter: number = 1;
      let bottommost: number = 1;

      for(let j = 0; j < numberOfEmployees; j++) {
        if(i != j) {
          if(this.employees[i].current_avg_effectiveness < this.employees[j].current_avg_effectiveness) effectivenessCounter++;
          if(this.employees[i].top3 < this.employees[j].top3) top3Counter++;
          if(this.employees[i].top10 < this.employees[j].top10) top10Counter++;
          if(this.employees[i].bottommost < this.employees[j].bottommost) bottommost++;
        }
      }

      if(bottommost > this.highestBottommost) this.highestBottommost = bottommost;

      this.placesAll.push({
        effectivenessPlace: effectivenessCounter,
        top3Place: top3Counter,
        top10Place: top10Counter,
        bottommostPlace: bottommost,
        employeeDocumentId: this.employees[i].documentId})
    }

    this.numberOfEmployees.emit(numberOfEmployees);
  }

  private onSelectEmployee(employee: EmployeeModel): void {
    this.selectedEmployee.emit(employee);
    this.activeId = employee.documentId;
    this.places.emit(this.placesAll.find(places => places.employeeDocumentId === employee.documentId))
  }


  private _filter(value: string): string[] {
    const newValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(newValue))
  }

  private isContaing(employee: string): boolean {
    return !!this.visibleEmployees.find(employee2 => employee2 === employee)
  }

  private setPlacesForEmployees(): void {
    if(confirm('Czy na pewno chcesz zaktualizować miejsca pracowników?')){
      this.placesAll.forEach(singlePlaces => {
        let top3: number = singlePlaces.effectivenessPlace < 4 ? 1 : 0;
        let top10: number = singlePlaces.effectivenessPlace < 11 ? 1 : 0;
        let bottommost: number = singlePlaces.bottommostPlace === this.highestBottommost ? 1 : 0;
        let employee: EmployeeModel = this.employees.find(employeeToFind => employeeToFind.documentId === singlePlaces.employeeDocumentId)
        this.employeeService.updatePlaces(singlePlaces.employeeDocumentId, employee.top3 + top3, employee.top10 + top10, employee.bottommost + bottommost);
      })
    }
  }
}
