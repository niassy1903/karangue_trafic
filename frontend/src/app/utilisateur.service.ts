import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getUtilisateurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Créer un nouvel utilisateur
  createUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, utilisateur);
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteMultipleUtilisateurs(ids: number[]): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/destroyMultiple`, { body: { ids } });
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
