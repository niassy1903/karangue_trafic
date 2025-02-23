import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { InfractionService } from '../infraction.service';
import { MapComponent } from '../map/map.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, NavbarComponent, FormsModule,MapComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers : [InfractionService]
})

export class DashboardComponent implements OnInit {
  totalInfractions = 0;
  @ViewChild('infractionChart') infractionChart!: ElementRef;

  alerts: any[] = [];
  currentPage = 1;
  totalPages = 1;
  perPage = 5;
  pages: number[] = [];

  constructor(private infractionService: InfractionService) {}

  ngOnInit() {
    this.loadTotalInfractions();
    this.loadInfractionsByPeriod();
    this.loadAlerts();
  }

  loadTotalInfractions() {
    this.infractionService.getAllInfractions(1, 10).subscribe(data => {
      this.totalInfractions = data.data.length;
    });
  }

  loadInfractionsByPeriod() {
    const periods = ['jour', 'semaine', 'mois'];
    const datasets: { label: string; data: number[]; borderColor: string; borderWidth: number; fill: boolean }[] = [];

    periods.forEach(period => {
      this.infractionService.getInfractionsByPeriod(period).subscribe(data => {
        datasets.push({
          label: `Infractions (${period})`,
          data: data.data.map((infraction: any) => infraction.vitesse), // Exemple de données
          borderColor: this.getRandomColor(),
          borderWidth: 2,
          fill: false
        });

        // Mettre à jour le graphique une fois toutes les données récupérées
        if (datasets.length === periods.length) {
          this.createChart(datasets);
        }
      });
    });
  }

  createChart(datasets: any[]) {
    if (this.infractionChart) {
      new Chart(this.infractionChart.nativeElement, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: datasets
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  loadAlerts() {
    this.infractionService.getInfractionsWithPagination(this.currentPage, this.perPage).subscribe(data => {
      this.alerts = data.data.data;
      this.totalPages = data.data.last_page;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAlerts();
    }
  }

  voirPlus() {
    alert("Afficher plus d'alertes");
  }
}