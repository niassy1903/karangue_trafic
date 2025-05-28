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
  private readonly TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes

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
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    localStorage.removeItem('utilisateur_id'); // Supprimer l'ID de l'utilisateur
    localStorage.removeItem('policeId'); // ✅ Supprimer l'ID de la police

    this.router.navigate(['/login']);
    clearTimeout(this.inactivityTimeout);
    window.removeEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.removeEventListener('keypress', this.resetInactivityTimer.bind(this));
    window.removeEventListener('click', this.resetInactivityTimer.bind(this));
  }

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
        console.log("Réponse serveur :", response);

        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role);
          localStorage.setItem('nom', response.user.nom);
          localStorage.setItem('prenom', response.user.prenom);
          localStorage.setItem('utilisateur_id', response.user.id); // Stocker l'ID de l'utilisateur
          localStorage.setItem('policeId', response.user.police_id); // ✅ Stocker l'ID de la police

          if (response.user.role === 'administrateur') {
            this.router.navigate(['/admin-dashboard']);
          } else if (response.user.role === 'agent de sécurité') {
            this.router.navigate(['/dashboard']);
          } else {
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

  getUserPrenom(): string | null {
    return localStorage.getItem('prenom');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserNom(): string | null {
    return localStorage.getItem('nom');
  }

  getUserId(): string | null {
    return localStorage.getItem('utilisateur_id'); // Méthode pour récupérer l'ID de l'utilisateur
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

  authenticateByRFID(uid: string, navigate: boolean = true): Observable<any> {
    const url = 'http://127.0.0.1:8000/api/authenticate-rfid';
  
    return this.http.post<any>(url, { carte_id: uid }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role);
          localStorage.setItem('nom', response.user.nom);
          localStorage.setItem('prenom', response.user.prenom);
          localStorage.setItem('utilisateur_id', response.user.id);
          localStorage.setItem('policeId', response.user.police_id);
  
          // ✅ NE NAVIGUE QUE SI DEMANDÉ
          if (navigate) {
            if (response.user.role === 'administrateur') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        }
      }),
      catchError((error) => {
        console.error('Erreur RFID :', error);
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Erreur inconnue',
          errors: error.error?.errors || {},
          status: error.status,
        }));
      })
    );
  }
  

  resetCodeSecret(email: string): Observable<any> {
    const url = 'http://127.0.0.1:8000/api/utilisateurs/reset-code';

    return this.http.post<any>(url, { email }).pipe(
      tap(response => {
        console.log("Réponse du serveur :", response);
      }),
      catchError(error => {
        console.error('Erreur lors de la réinitialisation du code secret:', error);
        return throwError(() => ({
          success: false,
          message: error.error?.message || 'Erreur inconnue',
          errors: error.error?.errors || {},
          status: error.status
        }));
      })
    );
  }
}
