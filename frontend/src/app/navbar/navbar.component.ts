import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

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
  unreadCount = 0;
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification) => {
      this.temporaryNotification = notification;
      setTimeout(() => {
        this.temporaryNotification = null;
      }, 10000); // Disparait après 10 secondes

      this.unreadCount++;
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  showUnreadNotifications() {
    const unreadNotifications = this.notificationService.getUnreadNotifications();
    if (unreadNotifications.length > 0) {
      Swal.fire({
        title: '<strong>Notifications</strong>',
        icon: 'info',
        html: `
          <div class="notification-container">
            ${unreadNotifications.map(notif => `
              <div class="notification-item">
                <div class="notification-content">
                  🚨 ${notif.message} (${notif.plaque}) à ${notif.heure}
                </div>
                <div class="notification-actions">
                  <button class="mark-as-read" data-index="${unreadNotifications.indexOf(notif)}">Marquer comme lu</button>
                  <button class="view-notification" data-index="${unreadNotifications.indexOf(notif)}">Voir</button>
                  <button class="transfer-notification" data-index="${unreadNotifications.indexOf(notif)}">Transférer</button>
                </div>
              </div>
            `).join('')}
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        customClass: {
          popup: 'custom-popup',
          htmlContainer: 'custom-html-container'
        }
      });

      document.querySelectorAll('.mark-as-read').forEach(button => {
        button.addEventListener('click', (event) => {
          const index = (event.target as HTMLElement).dataset['index'];
          this.notificationService.markAsRead(Number(index));
          Swal.fire('Notification marquée comme lue');
        });
      });

      document.querySelectorAll('.view-notification').forEach(button => {
        button.addEventListener('click', (event) => {
          const index = (event.target as HTMLElement).dataset['index'];
          Swal.fire({
            title: 'Détails de la notification',
            html: `<pre>${JSON.stringify(unreadNotifications[Number(index)], null, 2)}</pre>`,
            confirmButtonText: 'Fermer'
          });
        });
      });
    } else {
      Swal.fire({
        title: 'Aucune notification non lue',
        icon: 'info',
        confirmButtonText: 'Fermer'
      });
    }
  }
}