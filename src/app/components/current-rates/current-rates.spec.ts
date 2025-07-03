import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentRates } from './current-rates';

describe('CurrentRates', () => {
  let component: CurrentRates;
  let fixture: ComponentFixture<CurrentRates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentRates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentRates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
