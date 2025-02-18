import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs';

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getUtilisateurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }


  // Récupérer un utilisateur par ID
  getUtilisateur(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }


  // Créer un nouvel utilisateur
  createUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, utilisateur).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }



 
  // Mettre à jour un utilisateur
  updateUtilisateur(id: string, utilisateur: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUtilisateurs(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteMultiple`, { ids });
  }

  // Bloquer un utilisateur
  blockUtilisateur(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/block/${id}`, {});
  }

  // Bloquer plusieurs utilisateurs
  blockMultipleUtilisateurs(ids: number[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/block-multiple`, { ids });
  }

  
}
