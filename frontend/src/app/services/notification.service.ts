import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket = io('http://localhost:3000');

  private temporaryNotifications = new Subject<any>();
  private permanentNotifications: any[] = [];

  constructor(private http: HttpClient) {
    this.listenForNotifications();
  }


  // Observable pour écouter les notifications temporaires
  getNotifications(): Observable<any> {
    return this.temporaryNotifications.asObservable();
  }



  // Marquer une notification spécifique comme lue
  markAsRead(index: number): void {
    if (this.permanentNotifications[index]) {
      this.permanentNotifications[index].read = true;
    }
  }

  // Marquer toutes les notifications comme lues
  clearUnreadNotifications(): void {
    this.permanentNotifications.forEach(notif => notif.read = true);
  }
  
  // Rejoindre une salle spécifique pour recevoir ses notifications
  joinPoliceRoom(policeId: string): void {
    this.socket.emit('joinPoliceRoom', policeId);
  }

  // Retourner le nombre de notifications non lues
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }
  // Écouter les nouvelles notifications sans doublon
  private listenForNotifications(): void {
    this.socket.off('newNotification'); // Évite d'ajouter plusieurs écouteurs
    this.socket.on('newNotification', (data: any) => {
      if (data) {
        console.log('Notification reçue:', data); // Vérifiez les données reçues
        this.temporaryNotifications.next(data);
        this.permanentNotifications.unshift({ ...data, read: false }); // Ajouter avec statut "non lu"
        this.temporaryNotifications.next({ type: 'updateUnreadCount' }); // Trigger unread count update
      }
    });
  }

  // Retourner une copie des notifications permanentes
  getPermanentNotifications(): any[] {
    return [...this.permanentNotifications]; // Évite la modification directe
  }

  // Filtrer les notifications non lues
  getUnreadNotifications(): any[] {
    return this.permanentNotifications.filter(notif => !notif.read);
  }

  // Transférer une notification à une autre police
  transferNotification(notificationId: string, newPoliceId: string): Observable<any> {
    return this.http.post('http://localhost:8000/api/transferer-notification', {
      infraction_id: notificationId,
      new_police_id: newPoliceId
    });
  }

  getInfractionById(id: string): Observable<any> {
    return this.http.get(`http://localhost:8000/api/infractions/${id}`);
  }

  
}