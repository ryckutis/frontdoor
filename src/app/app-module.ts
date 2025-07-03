import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CurrencySelector } from './components/currency-selector/currency-selector';
import { CurrentRates } from './components/current-rates/current-rates';
import { HistoricalRates } from './components/historical-rates/historical-rates';
import { RateChart } from './components/rate-chart/rate-chart';

@NgModule({
  declarations: [
    App,
    CurrencySelector,
    CurrentRates,
    HistoricalRates,
    RateChart,
  ],
  imports: [BrowserModule, AppRoutingModule, BaseChartDirective],
  providers: [
    provideBrowserGlobalErrorListeners(),
    [provideCharts(withDefaultRegisterables())],
  ],
  bootstrap: [App],
})
export class AppModule {}
