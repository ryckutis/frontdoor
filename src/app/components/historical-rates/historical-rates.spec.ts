import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalRates } from './historical-rates';

describe('HistoricalRates', () => {
  let component: HistoricalRates;
  let fixture: ComponentFixture<HistoricalRates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricalRates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricalRates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
