import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [AuthService]
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '';
  userRole: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Récupérer le rôle de l'utilisateur depuis le localStorage
    this.userRole = localStorage.getItem('role');
  this.currentRoute = this.router.url; // Récupère l'URL actuelle
  }

  navigateTo(route: string) {
    this.router.navigate([route]).then(() => {
      this.currentRoute = this.router.url; // Met à jour après navigation
    });
  }
  
  logout() {
    this.authService.logout();
  }

  // Méthode pour vérifier si l'utilisateur est un administrateur
  isAdministrateur(): boolean {
    return this.userRole === 'administrateur';
  }

  // Méthode pour vérifier si l'utilisateur est un agent de sécurité
  isAgentDeSecurite(): boolean {
    return this.userRole === 'agent de sécurité';
  }
}