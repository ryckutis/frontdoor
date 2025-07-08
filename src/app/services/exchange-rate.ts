import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ExchangeRate } from '../models/exchange-rate';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  private readonly API_BASE_URL =
    'https://backdoor-jd9w.onrender.com/api/fxrates';
  // 'http://localhost:8080/api/fxrates';

  private selectedCurrencySubject = new BehaviorSubject<string>('USD');
  private selectedBaseCurrencySubject = new BehaviorSubject<string>('LT');

  public selectedCurrency$ = this.selectedCurrencySubject.asObservable();
  public selectedBaseCurrency$ =
    this.selectedBaseCurrencySubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentRates(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>(`${this.API_BASE_URL}/current`);
  }

  getRatesByDate(date: string): Observable<ExchangeRate[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ExchangeRate[]>(`${this.API_BASE_URL}/date`, {
      params,
    });
  }

  getHistoricalRates(
    baseCurrency: string,
    targetCurrency: string,
    days: number = 30
  ): Observable<ExchangeRate[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ExchangeRate[]>(
      `${this.API_BASE_URL}/historical/${baseCurrency}/${targetCurrency}`,
      { params }
    );
  }

  updateRates(): Observable<string> {
    return this.http.post(
      `${this.API_BASE_URL}/update`,
      {},
      {
        responseType: 'text',
      }
    );
  }

  setSelectedCurrency(currency: string): void {
    this.selectedCurrencySubject.next(currency);
  }

  getSelectedCurrency(): string {
    return this.selectedCurrencySubject.value;
  }

  setSelectedBaseCurrency(baseCurrency: string): void {
    this.selectedBaseCurrencySubject.next(baseCurrency);
  }

  getSelectedBaseCurrency(): string {
    return this.selectedBaseCurrencySubject.value;
  }

  getAvailableCurrencies(rates: ExchangeRate[]): string[] {
    const currencies = new Set<string>();
    rates.forEach((rate) => {
      currencies.add(rate.baseCurrency);
      currencies.add(rate.targetCurrency);
    });
    return Array.from(currencies).sort();
  }

  getAvailableBaseCurrencies(rates: ExchangeRate[]): string[] {
    const baseCurrencies = new Set<string>();
    rates.forEach((rate) => {
      baseCurrencies.add(rate.baseCurrency);
    });
    return Array.from(baseCurrencies).sort();
  }

  getFilteredRates(
    rates: ExchangeRate[],
    baseCurrency: string,
    targetCurrency: string
  ): ExchangeRate[] {
    return rates.filter(
      (rate) =>
        rate.baseCurrency === baseCurrency &&
        (targetCurrency === '' || rate.targetCurrency === targetCurrency)
    );
  }
}
