import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectivenessChartComponent } from './effectiveness-chart.component';

describe('EffectivenessChartComponent', () => {
  let component: EffectivenessChartComponent;
  let fixture: ComponentFixture<EffectivenessChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectivenessChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectivenessChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
