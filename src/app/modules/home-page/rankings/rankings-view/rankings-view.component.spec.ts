import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingsViewComponent } from './rankings-view.component';

describe('RankingsComponent', () => {
  let component: RankingsViewComponent;
  let fixture: ComponentFixture<RankingsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankingsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
