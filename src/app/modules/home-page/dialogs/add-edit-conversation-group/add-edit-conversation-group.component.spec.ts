import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditConversationGroupComponent } from './add-edit-conversation-group.component';

describe('AddEditConversationGroupComponent', () => {
  let component: AddEditConversationGroupComponent;
  let fixture: ComponentFixture<AddEditConversationGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditConversationGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditConversationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
