import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { UtilisateurService } from '../../services/utilisateur.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pie-chart',
  template: '<div style="width: 100%; height: 100%;"><canvas id="pieChart"></canvas></div>',
  standalone: true
})
export class PieChartComponent implements OnInit {
  private chart: Chart | undefined;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Utiliser forkJoin pour récupérer les trois comptages en parallèle
    forkJoin({
      conducteurs: this.utilisateurService.getDriversCount(),
      administrateurs: this.utilisateurService.getAdminCount(),
      agentsSecurite: this.utilisateurService.getSecurityAgentsCount()
    }).subscribe({
      next: (results) => {
        // Extraire les valeurs de comptage
        const conducteurs = results.conducteurs?.count || 0;
        const administrateurs = results.administrateurs?.count || 0;
        const agentsSecurite = results.agentsSecurite?.count || 0;
        
        // Créer le graphique avec les données récupérées
        this.createChart(conducteurs, administrateurs, agentsSecurite);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      }
    });
  }

  createChart(conducteurs: number, administrateurs: number, agentsSecurite: number) {
    // Détruire le graphique existant s'il y en a un
    if (this.chart) {
      this.chart.destroy();
    }

    // Créer un nouveau graphique
    this.chart = new Chart("pieChart", {
      type: 'doughnut',
      data: {
        labels: ['Conducteurs', 'Administrateurs', 'Agents de Sécurité'],
        datasets: [{
          data: [conducteurs, administrateurs, agentsSecurite],
          backgroundColor: [
            '#0088FE', // Bleu pour les conducteurs
            '#00C49F', // Vert pour les administrateurs
            '#FFBB28'  // Jaune pour les agents de sécurité
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value * 100) / total);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Répartition des utilisateurs par rôle',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
}