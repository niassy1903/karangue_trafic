import { UtilisateurService } from '../utilisateur.service';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, CommonModule, PieChartComponent, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [UtilisateurService],
})
export class AdminDashboardComponent {
  statsCards = [
    { title: 'Total Conducteurs', count: 0, icon: 'fa-car' },
    { title: 'Administrateurs', count: 0, icon: 'fa-user-cog' },
    { title: 'Agents de sécurité', count: 0, icon: 'fa-shield-alt' },
    { title: 'Utilisateurs', count: 0, icon: 'fa-users' }
  ];

  historyData: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  pages: number[] = [];
  Math = Math;

  constructor(private utilisateurService: UtilisateurService) {
    this.loadStats();
    this.loadHistoriques();
  }

  loadStats() {
    this.utilisateurService.getDriversCount().subscribe(data => this.statsCards[0].count = data.count);
    this.utilisateurService.getAdminCount().subscribe(data => this.statsCards[1].count = data.count);
    this.utilisateurService.getSecurityAgentsCount().subscribe(data => this.statsCards[2].count = data.count);
    this.utilisateurService.getTotalUsers().subscribe(data => this.statsCards[3].count = data.count);
  }

  loadHistoriques() {
    this.utilisateurService.getHistoriques().subscribe(data => {
      this.historyData = data;
      this.updatePagination();
    });
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.historyData.slice(start, end);
    this.totalPages = Math.ceil(this.historyData.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  deleteUtilisateur(id: number) {
    this.utilisateurService.deleteUtilisateur(id).subscribe(() => {
      this.loadStats();
      this.loadHistoriques();
    });
  }
}
