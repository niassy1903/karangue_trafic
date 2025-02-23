import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { NgZone } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/utilisateurs/authenticate';

   private inactivityTimeout: any;
  private readonly TIMEOUT_DURATION = 10 * 60 * 1000; // 3 minutes

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {}


  // Ajoutez cette méthode
  initInactivityTimer() {
    this.resetInactivityTimer();
    window.addEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.addEventListener('keypress', this.resetInactivityTimer.bind(this));
    window.addEventListener('click', this.resetInactivityTimer.bind(this));
  }

  private resetInactivityTimer() {
    this.ngZone.runOutsideAngular(() => {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(() => {
        this.ngZone.run(() => this.logout());
      }, this.TIMEOUT_DURATION);
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
    clearTimeout(this.inactivityTimeout);
    window.removeEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.removeEventListener('keypress', this.resetInactivityTimer.bind(this));
    window.removeEventListener('click', this.resetInactivityTimer.bind(this));
  }




  // auth.service.ts
  authenticate(codeSecret: string): Observable<any> {
  const code = parseInt(codeSecret, 10);

  if (isNaN(code)) {
    return throwError(() => ({
      success: false,
      message: 'Code invalide',
      errors: { code_secret: 'Doit contenir uniquement des chiffres' }
    }));
  }

  return this.http.post<any>(this.apiUrl, { code_secret: code }).pipe(
    tap(response => {
      console.log("Réponse serveur :", response); // ✅ Ajoute ceci pour voir la réponse complète

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.role); // Stocke le rôle

        // ✅ Redirection en fonction du rôle
        if (response.user.role === 'administrateur') {
          this.router.navigate(['/admin-dashboard']).then(() => {
            console.log("Redirection réussie vers /admin-dashboard");
          });
        } else if (response.user.role === 'agent de sécurité') {
          this.router.navigate(['/dashboard']).then(() => {
            console.log("Redirection réussie vers /dashboard");
          });
        } else {
          console.log("Rôle inconnu, redirection par défaut vers /dashboard");
          this.router.navigate(['/dashboard']);
        }
      }
    }),
    catchError(error => {
      console.error('Erreur complète:', error);
      return throwError(() => ({
        success: false,
        message: error.error?.message || 'Erreur inconnue',
        errors: error.error?.errors || {},
        status: error.status
      }));
    })
  );
}

  
  
  // ✅ Ajoute cette méthode pour récupérer le rôle de l'utilisateur
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

}
