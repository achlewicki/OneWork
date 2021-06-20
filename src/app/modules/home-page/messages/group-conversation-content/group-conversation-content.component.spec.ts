import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConversationContentComponent } from './group-conversation-content.component';

describe('GroupConversationContentComponent', () => {
  let component: GroupConversationContentComponent;
  let fixture: ComponentFixture<GroupConversationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupConversationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupConversationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
