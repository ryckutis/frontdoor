import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExchangeRate } from '../../models/exchange-rate';
import { ExchangeRateService } from '../../services/exchange-rate';

@Component({
  selector: 'app-current-rates',
  standalone: false,
  templateUrl: './current-rates.html',
  styleUrl: './current-rates.scss',
})
export class CurrentRates implements OnInit, OnDestroy {
  currentRates: ExchangeRate[] = [];
  filteredRates: ExchangeRate[] = [];
  selectedCurrency: string = 'USD';
  selectedBaseCurrency: string = 'LT';
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  private subscription = new Subscription();

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.loadCurrentRates();

    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        this.selectedCurrency = currency;
        this.filterRatesByCurrency();
      })
    );

    this.subscription.add(
      this.exchangeRateService.selectedBaseCurrency$.subscribe(
        (baseCurrency) => {
          this.selectedBaseCurrency = baseCurrency;
          this.filterRatesByCurrency();
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCurrentRates(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.exchangeRateService.getCurrentRates().subscribe({
        next: (rates: ExchangeRate[]) => {
          this.currentRates = rates;
          this.filterRatesByCurrency();
          this.lastUpdated = new Date();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load current rates. Please try again.';
          this.loading = false;
          console.error('Error loading current rates:', error);
        },
      })
    );
  }

  filterRatesByCurrency(): void {
    if (!this.currentRates.length) return;

    this.filteredRates = this.currentRates.filter((rate) => {
      const matchesBase = rate.baseCurrency === this.selectedBaseCurrency;
      const matchesTarget =
        !this.selectedCurrency ||
        this.selectedCurrency === '' ||
        rate.targetCurrency === this.selectedCurrency;
      return matchesBase && matchesTarget;
    });
  }

  refreshRates(): void {
    this.loadCurrentRates();
  }

  updateRates(): void {
    this.loading = true;
    this.subscription.add(
      this.exchangeRateService.updateRates().subscribe({
        next: () => {
          this.loadCurrentRates();
        },
        error: (error) => {
          this.error = 'Failed to update rates. Please try again.';
          this.loading = false;
          console.error('Error updating rates:', error);
        },
      })
    );
  }
}
