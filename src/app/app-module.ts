import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
import { SkeletonLoader } from './skeleton-loader/skeleton-loader';

@NgModule({
  declarations: [
    App,
    CurrencySelector,
    CurrentRates,
    HistoricalRates,
    RateChart,
    SkeletonLoader,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables()), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
