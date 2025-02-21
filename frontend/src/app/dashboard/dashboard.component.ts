import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, NavbarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  totalInfractions = 20;
  totalAdmins = 10;
  totalUsers = 200;

  alerts = [
    { nom: 'Mouhamad Diop', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Moustapha Dieng', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Aly Gueye', matricule: 'DK2547A', zone: 1, vitesse: 100 },
    { nom: 'Massamba Ndoye', matricule: 'DK2547A', zone: 1, vitesse: 100 }
  ];

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

  voirPlus() {
    alert("Afficher plus d'alertes");
  }
}