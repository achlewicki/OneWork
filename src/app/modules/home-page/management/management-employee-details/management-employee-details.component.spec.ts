import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementEmployeeDetailsComponent } from './management-employee-details.component';

describe('ManagementEmployeeDetailsComponent', () => {
  let component: ManagementEmployeeDetailsComponent;
  let fixture: ComponentFixture<ManagementEmployeeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagementEmployeeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementEmployeeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
