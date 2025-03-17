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
  private apiUrl2 = 'http://localhost:8000/api'; // Modifier selon l'URL de ton API

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

  // Méthodes pour récupérer les logs de l'historique
  getHistoriques(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl2}/historiques`, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
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




 // Méthodes pour compter les utilisateurs
 getTotalUsers(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/users/count`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

// Méthodes pour compter les administrateurs
getAdminCount(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/administrateurs/count`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

// Méthodes pour compter les agents de sécurité
getSecurityAgentsCount(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/agents-securite/count`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}


// Méthodes pour compter les conducteurs
getDriversCount(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/conducteurs/count`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}



// Méthodes pour récupérer les logs de l'historique

getHistoriqueById(id: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/${id}`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}



// Méthode pour assigner une carte à un utilisateur
assignCard(id: number, cardId: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/${id}/assigner-carte`, { carte_id: cardId }, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

getRFIDUID(): Observable<{ uid: string }> {
  const headers = this.getAuthHeaders();
  return this.http.get<{ uid: string }>('http://localhost:3000/rfid', { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}



getPolices(): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.get(`${this.apiUrl2}/polices`, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

transfererNotification(data: any): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post(`${this.apiUrl2}/transferer-notification`, data, { headers }).pipe(
    catchError((error) => {
      return throwError(error);
    })
  );
}

}
