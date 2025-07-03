import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateChart } from './rate-chart';

describe('RateChart', () => {
  let component: RateChart;
  let fixture: ComponentFixture<RateChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RateChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
