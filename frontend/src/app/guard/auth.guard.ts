// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const userRole = this.authService.getUserRole();

    if (!isAuthenticated || userRole !== 'administrateur') {
      this.router.navigate(['/login']);
      return false;
    }

    this.authService.initInactivityTimer(); // Gérer l'inactivité
    return true;
  }
}
