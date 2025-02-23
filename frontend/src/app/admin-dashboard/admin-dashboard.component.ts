import { UtilisateurService } from './../utilisateur.service';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, PieChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [UtilisateurService]
})
export class AdminDashboardComponent {

  statsCards = [
    { title: 'Total Conducteurs', count: 0, icon: 'fa-car' },
    { title: 'Administrateurs', count: 0, icon: 'fa-user-cog' },
    { title: 'Agents de sécurité', count: 0, icon: 'fa-shield-alt' },
    { title: 'Utilisateurs', count: 0, icon: 'fa-users' }
  ];

  historyData: any[] = [];

  constructor(
    private utilisateurService: UtilisateurService
  ) {
    this.loadStats();
    this.loadHistoriques();
  }

  loadStats() {
    this.utilisateurService.getDriversCount().subscribe(
      data => this.statsCards[0].count = data.count
    );

    this.utilisateurService.getAdminCount().subscribe(
      data => this.statsCards[1].count = data.count
    );

    this.utilisateurService.getSecurityAgentsCount().subscribe(
      data => this.statsCards[2].count = data.count
    );

    this.utilisateurService.getTotalUsers().subscribe(
      data => this.statsCards[3].count = data.count
    );
  }

  loadHistoriques() {
    this.utilisateurService.getHistoriques().subscribe(
      data => {
        console.log(data); // Ajoutez cette ligne pour vérifier les données dans la console
        this.historyData = data;
      }
    );
  }

  deleteUtilisateur(id: number) {
    this.utilisateurService.deleteUtilisateur(id).subscribe(() => {
      this.loadStats();
      this.loadHistoriques();
    });
  }
}