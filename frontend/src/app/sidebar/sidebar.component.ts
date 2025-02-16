import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  currentRoute: string = '';

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.currentRoute = route; // Met à jour l'URL active
    this.router.navigate([route]);
  }

  logout() {
    // Supprime les données de session si nécessaire
    localStorage.removeItem('userToken');

    // Redirige vers la page de connexion
    this.navigateTo('/login');
  }

}