import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';  // Assure-toi d'importer AuthService

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs';

  constructor(
    private http: HttpClient,
    private authService: AuthService  // Injecte AuthService pour récupérer le token
  ) {}

  // Fonction pour récupérer les headers avec token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();  // Récupère le token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Récupérer tous les utilisateurs
  getUtilisateurs(): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.get(`${this.apiUrl}`, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Récupérer un utilisateur par ID
  getUtilisateur(id: string): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.get(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Créer un nouvel utilisateur
  createUtilisateur(utilisateur: any): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.post(`${this.apiUrl}`, utilisateur, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Mettre à jour un utilisateur
  updateUtilisateur(id: string, utilisateur: any): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUtilisateurs(ids: number[]): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.post(`${this.apiUrl}/deleteMultiple`, { ids }, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Bloquer un utilisateur
  blockUtilisateur(id: number): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.put(`${this.apiUrl}/block/${id}`, {}, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Bloquer plusieurs utilisateurs
  blockMultipleUtilisateurs(ids: number[]): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.post(`${this.apiUrl}/block-multiple`, { ids }, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Authentifier un utilisateur
  authenticate(codeSecret: string): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.post(`${this.apiUrl}/authenticate`, { code_secret: codeSecret }, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Déconnexion de l'utilisateur
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();  // Ajoute les headers avec token
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Stocker le token dans le local storage
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtenir le token du local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Supprimer le token du local storage
  removeToken(): void {
    localStorage.removeItem('token');
  }
}
