import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfractionService {
  private apiUrl = 'https://karangue-backend.onrender.com/api'; // Modifier selon l'URL de ton API
  constructor(private http: HttpClient, private authService: AuthService) {}


  // Récupérer toutes les infractions
  getAllInfractions(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/toutes-infractions?page=${page}&limit=${limit}`);
  }

  // Enregistrer une nouvelle infraction
  addInfraction(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enregistrer-infraction`, data);
  }

// Payer une amende

 // Payer une amende

payAmende(id: number, montant: number): Observable<any> {
  const utilisateurId = this.authService.getUserId(); // Utilisez getUserId pour récupérer l'ID de l'utilisateur

  // Vérifiez que l'ID de l'utilisateur est bien défini
  if (!utilisateurId) {
    return throwError(() => new Error('ID de l\'utilisateur non valide.'));
  }

  return this.http.post(`${this.apiUrl}/payer-amende/${id}`, {
    montant,
    utilisateur_id: utilisateurId, // Utilisez l'ID de l'utilisateur récupéré
    agent_nom: this.authService.getUserNom() || 'Agent Inconnu' // Ajouter le nom de l'agent
  });
}

  // Récupérer les infractions par période (jour, semaine, mois)
  getInfractionsByPeriod(periode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/infractions-par-periode`, { params: { periode } });
  }

  getInfractionsWithPagination(page: number, perPage: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/infractions-avec-pagination`, {
      params: { page, per_page: perPage }
    });
  }
}