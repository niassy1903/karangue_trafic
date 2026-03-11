import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriquePaiementService {
  private apiUrl = 'https://trafic-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  getHistoriquePaiements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historique-paiements?include=infraction,utilisateur`);
  }
}