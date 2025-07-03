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

  private selectedCurrencySubject = new BehaviorSubject<string>('USD');
  public selectedCurrency$ = this.selectedCurrencySubject.asObservable();

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
    return this.http.post<string>(`${this.API_BASE_URL}/update`, {});
  }

  setSelectedCurrency(currency: string): void {
    this.selectedCurrencySubject.next(currency);
  }

  getSelectedCurrency(): string {
    return this.selectedCurrencySubject.value;
  }

  getAvailableCurrencies(rates: ExchangeRate[]): string[] {
    const currencies = new Set<string>();
    rates.forEach((rate) => {
      currencies.add(rate.baseCurrency);
      currencies.add(rate.targetCurrency);
    });
    return Array.from(currencies).sort();
  }
}
