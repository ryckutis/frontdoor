import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ExchangeRate } from '../../models/exchange-rate';
import { ExchangeRateService } from '../../services/exchange-rate';

@Component({
  selector: 'app-rate-chart',
  standalone: false,
  templateUrl: './rate-chart.html',
  styleUrl: './rate-chart.scss',
})
export class RateChart implements OnInit, OnDestroy {
  selectedCurrency: string = 'USD';
  selectedPeriod: number = 30;
  loading = false;
  error: string | null = null;
  private subscription = new Subscription();

  availablePeriods = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
  ];

  public rateChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  public rateChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'EUR Exchange Rate History',
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Exchange Rate',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  public rateChartLegend = true;

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit(): void {
    // Subscribe to currency selection changes
    this.subscription.add(
      this.exchangeRateService.selectedCurrency$.subscribe((currency) => {
        this.selectedCurrency = currency;
        this.loadChartData();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadChartData(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.exchangeRateService
        .getHistoricalRates('EUR', this.selectedCurrency, this.selectedPeriod)
        .subscribe({
          next: (rates: ExchangeRate[]) => {
            this.updateChart(rates);
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load chart data. Please try again.';
            this.loading = false;
            console.error('Error loading chart data:', error);
          },
        })
    );
  }

  updateChart(rates: ExchangeRate[]): void {
    // Sort rates by date
    const sortedRates = rates.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract labels and data
    const labels = sortedRates.map((rate) =>
      new Date(rate.date).toLocaleDateString()
    );
    const data = sortedRates.map((rate) => rate.rate);

    this.rateChartData = {
      labels,
      datasets: [
        {
          data,
          label: `EUR/${this.selectedCurrency}`,
          fill: false,
          tension: 0.3,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(75, 192, 192)',
        },
      ],
    };

    // Update chart title
    this.rateChartOptions.plugins!.title!.text = `EUR/${this.selectedCurrency} Exchange Rate History`;
  }

  onPeriodChange(): void {
    this.loadChartData();
  }
}
