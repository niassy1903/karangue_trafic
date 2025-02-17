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
  private readonly TIMEOUT_DURATION = 3 * 60 * 1000; // 3 minutes

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
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(error => {
        console.error('Erreur complète:', error);
        
        let errorMessage = 'Erreur inconnue';
        let errors = {};
        
        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur';
        } else if (error.error) {
          errorMessage = error.error.message || errorMessage;
          errors = error.error.errors || {};
        }
  
        return throwError(() => ({ 
          success: false,
          message: errorMessage,
          errors,
          status: error.status
        }));
      })
    );
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
