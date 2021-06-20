import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomePageMainComponent } from './welcome-page-main.component';

describe('WelcomePageMainComponent', () => {
  let component: WelcomePageMainComponent;
  let fixture: ComponentFixture<WelcomePageMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomePageMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomePageMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
