import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket = io('https://notification-y4ln.onrender.com');

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
  this.socket.off('newNotification');
  this.socket.on('newNotification', (data: any) => {
    if (data) {
      console.log('Notification reçue:', data);
      this.temporaryNotifications.next(data);
      this.permanentNotifications.unshift({ ...data, read: false });
      this.temporaryNotifications.next({ type: 'updateUnreadCount' });
      this.playNotificationSound(); // Assurez-vous que cette ligne est présente

      this.showBrowserNotification('Nouvelle Notification', {
          body: data.message,
          icon: 'trafic.jpeg',
        });
      }

  });
}

/**
 * Affiche une notification navigateur si les permissions sont accordées.
 */
private showBrowserNotification(title: string, options?: NotificationOptions): void {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  }
}

// Joue un son de notification
private playNotificationSound(): void {
  const audio = new Audio('/sounds/alert.mp3');
  audio.play().catch(e => console.error('Erreur lors de la lecture du son de notification:', e));
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
    return this.http.post('https://trafic-backend.onrender.com/api/transferer-notification', {
      infraction_id: notificationId,
      new_police_id: newPoliceId
    });
  }

  getInfractionById(id: string): Observable<any> {
    return this.http.get(`https://trafic-backend.onrender.com/api/infractions/${id}`);
  }

  
}