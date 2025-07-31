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
  private updateRatesInterval: any;

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.loadCurrentRates();
    this.scheduleUpdateRates();

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
    if (this.updateRatesInterval) {
      clearInterval(this.updateRatesInterval);
    }
  }

  loadCurrentRates(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.exchangeRateService.getCurrentRates().subscribe({
        next: (rates) => {
          this.currentRates = rates;
          this.lastUpdated = new Date();
          this.loading = false;
          this.filterRatesByCurrency();
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        },
      })
    );
  }

  filterRatesByCurrency(): void {
    if (this.selectedCurrency && this.currentRates) {
      this.filteredRates = this.currentRates.filter(
        (rate) => rate.targetCurrency === this.selectedCurrency
      );
    }
  }

  refreshRates(): void {
    this.loadCurrentRates();
  }

  updateRates(): void {
    this.scheduleUpdateRates();
  }

  scheduleUpdateRates(): void {
    const updateTime = new Date();
    updateTime.setHours(18, 0, 0, 0);
    if (updateTime < new Date()) {
      updateTime.setDate(updateTime.getDate() + 1);
    }

    const timeToNextUpdate = updateTime.getTime() - new Date().getTime();

    this.updateRatesInterval = setTimeout(() => {
      this.loadCurrentRates();

      this.scheduleUpdateRates();
    }, timeToNextUpdate);
  }
}
