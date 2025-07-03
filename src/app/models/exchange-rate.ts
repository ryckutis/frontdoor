export interface ExchangeRate {
  id?: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  date: string;
}
