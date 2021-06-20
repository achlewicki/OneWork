import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementEmployeesListComponent } from './management-employees-list.component';

describe('ManagementEmployeesListComponent', () => {
  let component: ManagementEmployeesListComponent;
  let fixture: ComponentFixture<ManagementEmployeesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagementEmployeesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementEmployeesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
