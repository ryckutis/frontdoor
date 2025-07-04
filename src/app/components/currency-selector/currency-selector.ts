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
  availableBaseCurrencies: string[] = [];
  selectedCurrency: string = 'USD';
  selectedBaseCurrency: string = 'LT';
  loading = false;
  private subscription = new Subscription();

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.loadAvailableCurrencies();

    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        this.selectedCurrency = currency;
      })
    );

    this.subscription.add(
      this.exchangeRateService.selectedBaseCurrency$.subscribe(
        (baseCurrency) => {
          this.selectedBaseCurrency = baseCurrency;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAvailableCurrencies(): void {
    this.loading = true;
    this.subscription.add(
      this.exchangeRateService.getRecentRates().subscribe({
        next: (rates: ExchangeRate[]) => {
          this.availableCurrencies =
            this.exchangeRateService.getAvailableCurrencies(rates);
          this.availableBaseCurrencies =
            this.exchangeRateService.getAvailableBaseCurrencies(rates);

          if (this.availableBaseCurrencies.length > 0) {
            if (
              !this.availableBaseCurrencies.includes(this.selectedBaseCurrency)
            ) {
              this.selectedBaseCurrency = this.availableBaseCurrencies[0];
              this.exchangeRateService.setSelectedBaseCurrency(
                this.selectedBaseCurrency
              );
            }
          }

          if (this.availableCurrencies.length > 0) {
            if (!this.availableCurrencies.includes(this.selectedCurrency)) {
              this.selectedCurrency = this.availableCurrencies[0];
              this.exchangeRateService.setSelectedCurrency(
                this.selectedCurrency
              );
            }
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading currencies:', error);
          this.loading = false;
          this.availableCurrencies = [
            'USD',
            'EUR',
            'GBP',
            'JPY',
            'CHF',
            'CAD',
            'AUD',
            'SEK',
            'NOK',
            'DKK',
          ];
          this.availableBaseCurrencies = ['LT', 'EU'];
        },
      })
    );
  }

  onCurrencyChange(): void {
    this.exchangeRateService.setSelectedCurrency(this.selectedCurrency);
  }

  onBaseCurrencyChange(): void {
    this.exchangeRateService.setSelectedBaseCurrency(this.selectedBaseCurrency);
  }
}
