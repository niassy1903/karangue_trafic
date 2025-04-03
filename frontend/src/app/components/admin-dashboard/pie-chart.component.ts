// pie-chart.component.ts
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-pie-chart',
  template: '<canvas id="pieChart"></canvas>',
  standalone: true,
  providers : [HttpClient,HttpClientModule]
})
export class PieChartComponent implements OnInit {
  ngOnInit() {
    this.createChart();
  }

  createChart() {
    new Chart("pieChart", {
      type: 'doughnut',
      data: {
        labels: ['Inscription', 'Card Range', 'Autre'],
        datasets: [{
          data: [800, 600, 665.01],
          backgroundColor: [
            '#0088FE',
            '#00C49F',
            '#FFBB28'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}