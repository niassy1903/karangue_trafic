import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfractionService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Modifier selon l'URL de ton API

  constructor(private http: HttpClient) {}

  // Récupérer toutes les infractions
  getAllInfractions(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/toutes-infractions?page=${page}&limit=${limit}`);
  }

  // Enregistrer une nouvelle infraction
  addInfraction(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enregistrer-infraction`, data);
  }

  // Payer une amende
  payAmende(id: number, montant: number): Observable<any> {
    // Récupérer les informations de l'agent connecté
    const agent = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    return this.http.post(`${this.apiUrl}/payer-amende/${id}`, { 
      montant,
      utilisateur_id: agent.id, // ID de l'agent
      agent_nom: agent.nom // Nom de l'agent
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