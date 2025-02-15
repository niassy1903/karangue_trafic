import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  totalInfractions = 20;
  totalAdmins = 10;
  totalUsers = 200;

  alerts = [
    { nom: 'Mouhamad Diop', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Mouhamad Diop', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Mouhamad Diop', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Mouhamad Diop', matricule: 'DK2547A', zone: 1, vitesse: 100 }
  ];

  voirPlus() {
    alert("Afficher plus d'alertes");
  }
}
