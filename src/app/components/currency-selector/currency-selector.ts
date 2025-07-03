import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExchangeRate } from '../../models/exchange-rate';
import { ExchangeRateService } from '../../services/exchange-rate';

@Component({
  selector: 'app-currency-selector',
  standalone: false,
  templateUrl: './currency-selector.html',
  styleUrl: './currency-selector.scss',
})
export class CurrencySelector implements OnInit, OnDestroy {
  availableCurrencies: string[] = [];
  selectedCurrency: string = 'USD';
  loading = false;
  private subscription = new Subscription();

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.loadAvailableCurrencies();

    // Subscribe to selected currency changes
    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        this.selectedCurrency = currency;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAvailableCurrencies(): void {
    this.loading = true;
    this.subscription.add(
      this.exchangeRateService.getCurrentRates().subscribe({
        next: (rates: ExchangeRate[]) => {
          this.availableCurrencies =
            this.exchangeRateService.getAvailableCurrencies(rates);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading currencies:', error);
          this.loading = false;
          // Fallback currencies
          this.availableCurrencies = [
            'USD',
            'GBP',
            'JPY',
            'CHF',
            'CAD',
            'AUD',
            'SEK',
            'NOK',
            'DKK',
          ];
        },
      })
    );
  }

  onCurrencyChange(): void {
    this.exchangeRateService.setSelectedCurrency(this.selectedCurrency);
  }
}
