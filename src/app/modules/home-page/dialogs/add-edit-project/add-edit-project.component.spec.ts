import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectComponent } from './add-edit-project.component';

describe('AddProjectComponent', () => {
  let component: AddEditProjectComponent;
  let fixture: ComponentFixture<AddEditProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
