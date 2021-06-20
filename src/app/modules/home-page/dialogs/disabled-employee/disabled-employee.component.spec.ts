import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledEmployeeComponent } from './disabled-employee.component';

describe('DisabledEmployeeComponent', () => {
  let component: DisabledEmployeeComponent;
  let fixture: ComponentFixture<DisabledEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
