import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket = io('http://localhost:3000');
  private temporaryNotifications = new Subject<any>();
  private permanentNotifications: any[] = [];

  constructor() {}

  // Écouter les nouvelles notifications
  getNotifications(): Observable<any> {
    this.socket.on('newNotification', (data) => {
      this.temporaryNotifications.next(data);
      this.permanentNotifications.unshift(data);
    });
    return this.temporaryNotifications.asObservable();
  }

  getPermanentNotifications(): any[] {
    return this.permanentNotifications;
  }

  getUnreadNotifications(): any[] {
    return this.permanentNotifications.filter(notif => !notif.read);
  }

  markAsRead(index: number): void {
    if (this.permanentNotifications[index]) {
      this.permanentNotifications[index].read = true;
    }
  }
}
