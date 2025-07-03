import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExchangeRate } from '../../models/exchange-rate';
import { ExchangeRateService } from '../../services/exchange-rate';

@Component({
  selector: 'app-historical-rates',
  standalone: false,
  templateUrl: './historical-rates.html',
  styleUrl: './historical-rates.scss',
})
export class HistoricalRates implements OnInit, OnDestroy {
  historicalRates: ExchangeRate[] = [];
  selectedCurrency: string = 'USD';
  selectedBaseCurrency: string = 'LT';
  selectedPeriod: number = 30;
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();

  availablePeriods = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
    { value: 365, label: '1 year' },
  ];

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        this.selectedCurrency = currency;
        this.loadHistoricalRates();
      })
    );

    this.subscription.add(
      this.exchangeRateService.selectedBaseCurrency$.subscribe(
        (baseCurrency) => {
          this.selectedBaseCurrency = baseCurrency;
          this.loadHistoricalRates();
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadHistoricalRates(): void {
    if (!this.selectedBaseCurrency || !this.selectedCurrency) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.exchangeRateService
        .getHistoricalRates(
          this.selectedBaseCurrency,
          this.selectedCurrency,
          this.selectedPeriod
        )
        .subscribe({
          next: (rates: ExchangeRate[]) => {
            this.historicalRates = rates.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load historical rates. Please try again.';
            this.loading = false;
            console.error('Error loading historical rates:', error);
          },
        })
    );
  }

  onPeriodChange(): void {
    this.loadHistoricalRates();
  }

  calculateChange(currentRate: number, previousRate: number): number {
    return ((currentRate - previousRate) / previousRate) * 100;
  }
}
