import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin, of, interval } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ExchangeRateService } from './services/exchange-rate';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected title = 'frontdoor';
  protected isAppLoading = true;
  protected loadingError = false;
  isDarkMode = false;

  private readonly THEME_KEY = 'theme-preference';

  private destroy$ = new Subject<void>();

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.initializeTheme();
    this.startKeepAlive();
    console.log('App initialized, keep-alive should start');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Check system preference
      this.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
    }

    this.applyTheme();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.saveThemePreference();
  }

  private applyTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  private saveThemePreference(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private startKeepAlive(): void {
    console.log('startKeepAlive() method called!');
    interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Sending keep-alive ping at:', new Date().toISOString());
        this.exchangeRateService.getCurrentRates().subscribe({
          next: () => {
            console.log('Keep-alive ping successful');
          },
          error: (error) => {
            console.error('Keep-alive ping failed:', error);
          },
        });
      });
  }

  private loadInitialData(): void {
    const currentRates$ = this.exchangeRateService.getCurrentRates().pipe(
      catchError((error) => {
        console.error('Error loading current rates:', error);
        return of([]);
      })
    );

    const selectedBaseCurrency =
      this.exchangeRateService.getSelectedBaseCurrency();
    const selectedCurrency = this.exchangeRateService.getSelectedCurrency();

    const historicalRates$ = this.exchangeRateService
      .getHistoricalRates(selectedBaseCurrency, selectedCurrency)
      .pipe(
        catchError((error) => {
          console.error('Error loading historical rates:', error);
          return of([]);
        })
      );

    forkJoin({
      currentRates: currentRates$,
      historicalRates: historicalRates$,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isAppLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          console.log('Initial data loaded:', data);
        },
        error: (error) => {
          console.error('Unexpected error during initial load:', error);
          this.loadingError = true;
        },
      });
  }

  protected retryLoading(): void {
    this.isAppLoading = true;
    this.loadingError = false;
    this.loadInitialData();
  }
}
