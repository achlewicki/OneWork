import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConversationsListComponent } from './group-conversations-list.component';

describe('GroupConversationsListComponent', () => {
  let component: GroupConversationsListComponent;
  let fixture: ComponentFixture<GroupConversationsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupConversationsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupConversationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
