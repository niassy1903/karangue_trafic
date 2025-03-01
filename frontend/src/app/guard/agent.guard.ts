import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgentGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const userRole = this.authService.getUserRole(); // Récupère le rôle de l'utilisateur connecté
    if (userRole === 'agent de sécurité') {
      return true; // Autorisé
    } else {
      this.router.navigate(['/login']); // Redirige si non autorisé
      return false;
    }
  }
}
