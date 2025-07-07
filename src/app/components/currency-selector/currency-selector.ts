import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  selectedCurrency: string = '';
  selectedBaseCurrency: string = '';
  loading = false;
  euDataAvailable = false;
  ltDataAvailable = false;
  private subscription = new Subscription();

  private expectedBaseCurrencies = ['LT', 'EU'];
  private fallbackCurrencies = [
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

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    console.log('CurrencySelector: ngOnInit called');

    this.selectedCurrency = this.exchangeRateService.getSelectedCurrency();
    this.selectedBaseCurrency =
      this.exchangeRateService.getSelectedBaseCurrency();

    console.log('Initial selected currency:', this.selectedCurrency);
    console.log('Initial selected base currency:', this.selectedBaseCurrency);

    this.loadAvailableCurrencies();

    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        console.log('Currency changed to:', currency);
        this.selectedCurrency = currency;
      })
    );

    this.subscription.add(
      this.exchangeRateService.selectedBaseCurrency$.subscribe(
        (baseCurrency) => {
          console.log('Base currency changed to:', baseCurrency);
          this.selectedBaseCurrency = baseCurrency;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAvailableCurrencies(): void {
    console.log('Loading available currencies...');
    this.loading = true;

    const currentRates$ = this.exchangeRateService.getCurrentRates().pipe(
      catchError((error) => {
        console.log('Current rates failed:', error);
        return of([]);
      })
    );

    const recentRates$ = this.exchangeRateService.getRecentRates().pipe(
      catchError((error) => {
        console.log('Recent rates failed:', error);
        return of([]);
      })
    );

    this.subscription.add(
      forkJoin({
        currentRates: currentRates$,
        recentRates: recentRates$,
      }).subscribe({
        next: (data) => {
          console.log('Current rates:', data.currentRates);
          console.log('Recent rates:', data.recentRates);

          const allRates = [...data.currentRates, ...data.recentRates];
          console.log('Combined rates:', allRates);

          this.processRatesData(allRates);
        },
        error: (error) => {
          console.error('Error loading currencies:', error);
          this.handleFallback();
        },
      })
    );
  }

  private processRatesData(rates: ExchangeRate[]): void {
    console.log('Processing rates data:', rates);

    if (!Array.isArray(rates) || rates.length === 0) {
      console.log('No rates data available, using fallback');
      this.handleFallback();
      return;
    }

    const extractedCurrencies =
      this.exchangeRateService.getAvailableCurrencies(rates);
    const extractedBaseCurrencies =
      this.exchangeRateService.getAvailableBaseCurrencies(rates);

    console.log('Extracted currencies:', extractedCurrencies);
    console.log('Extracted base currencies:', extractedBaseCurrencies);

    this.availableBaseCurrencies = [...this.expectedBaseCurrencies];

    this.ltDataAvailable = extractedBaseCurrencies.includes('LT');
    this.euDataAvailable = extractedBaseCurrencies.includes('EU');

    console.log('LT data available:', this.ltDataAvailable);
    console.log('EU data available:', this.euDataAvailable);

    if (extractedCurrencies.length > 0) {
      this.availableCurrencies = extractedCurrencies;
    } else {
      this.availableCurrencies = this.fallbackCurrencies;
    }

    console.log('Final available currencies:', this.availableCurrencies);
    console.log(
      'Final available base currencies:',
      this.availableBaseCurrencies
    );

    this.setDefaultSelections();

    this.loading = false;
  }

  private setDefaultSelections(): void {
    if (
      !this.selectedBaseCurrency ||
      !this.availableBaseCurrencies.includes(this.selectedBaseCurrency)
    ) {
      if (this.ltDataAvailable) {
        this.selectedBaseCurrency = 'LT';
      } else if (this.euDataAvailable) {
        this.selectedBaseCurrency = 'EU';
      } else {
        this.selectedBaseCurrency = this.availableBaseCurrencies[0];
      }

      console.log('Setting default base currency:', this.selectedBaseCurrency);
      this.exchangeRateService.setSelectedBaseCurrency(
        this.selectedBaseCurrency
      );
    }

    if (
      !this.selectedCurrency ||
      !this.availableCurrencies.includes(this.selectedCurrency)
    ) {
      this.selectedCurrency = this.availableCurrencies[0] || 'USD';
      console.log('Setting default target currency:', this.selectedCurrency);
      this.exchangeRateService.setSelectedCurrency(this.selectedCurrency);
    }
  }

  private handleFallback(): void {
    console.log('Using fallback currencies');
    this.loading = false;

    this.availableBaseCurrencies = [...this.expectedBaseCurrencies];
    this.availableCurrencies = [...this.fallbackCurrencies];

    this.ltDataAvailable = false;
    this.euDataAvailable = false;

    this.selectedBaseCurrency = 'LT';
    this.selectedCurrency = 'USD';

    console.log('Fallback - setting base currency:', this.selectedBaseCurrency);
    console.log('Fallback - setting target currency:', this.selectedCurrency);

    this.exchangeRateService.setSelectedBaseCurrency(this.selectedBaseCurrency);
    this.exchangeRateService.setSelectedCurrency(this.selectedCurrency);
  }

  onCurrencyChange(): void {
    console.log('Currency changed to:', this.selectedCurrency);
    this.exchangeRateService.setSelectedCurrency(this.selectedCurrency);
  }

  onBaseCurrencyChange(): void {
    console.log('Base currency changed to:', this.selectedBaseCurrency);
    this.exchangeRateService.setSelectedBaseCurrency(this.selectedBaseCurrency);
  }

  isDataAvailable(baseCurrency: string): boolean {
    if (baseCurrency === 'LT') return this.ltDataAvailable;
    if (baseCurrency === 'EU') return this.euDataAvailable;
    return true;
  }

  getStatusText(baseCurrency: string): string {
    if (baseCurrency === 'LT')
      return this.ltDataAvailable ? 'Available' : 'No recent data';
    if (baseCurrency === 'EU')
      return this.euDataAvailable ? 'Available' : 'No recent data';
    return 'Available';
  }
}
