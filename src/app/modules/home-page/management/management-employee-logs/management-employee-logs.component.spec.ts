import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementEmployeeLogsComponent } from './management-employee-logs.component';

describe('ManagementEmployeeLogsComponent', () => {
  let component: ManagementEmployeeLogsComponent;
  let fixture: ComponentFixture<ManagementEmployeeLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagementEmployeeLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementEmployeeLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
