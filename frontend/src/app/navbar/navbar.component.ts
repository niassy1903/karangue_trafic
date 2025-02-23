import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone:true,
  imports : [CommonModule,HttpClientModule],
  providers: [NotificationService]
})
export class NavbarComponent implements OnInit, OnDestroy {
  temporaryNotification: any = null;
  permanentNotifications: any[] = [];
  unreadCount = 0;
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification) => {
      this.temporaryNotification = notification;
      setTimeout(() => {
        this.temporaryNotification = null;
      }, 5000); // Disparait après 5 secondes

      this.permanentNotifications.unshift(notification);
      this.unreadCount++;
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  markAsRead() {
    this.unreadCount = 0;
    this.notificationService.markAsRead();
  }

  transferNotification() {
    // Logique de transfert de notification
  }
}