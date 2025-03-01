import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [NotificationService, AuthService],
})
export class NavbarComponent implements OnInit, OnDestroy {
  temporaryNotification: any = null;
  unreadCount = 0;
  userPrenom: string | null = '';
  userNom: string | null = '';
  userRole: string | null = '';
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService, private authService: AuthService) {}

  ngOnInit() {
    this.userPrenom = this.authService.getUserPrenom();
    this.userNom = this.authService.getUserNom();
    this.userRole = this.authService.getUserRole();

    const policeId = localStorage.getItem('policeId');

    // Écoute des notifications et mise à jour du compteur
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification) => {
      if (notification.police_id === policeId) {
        this.temporaryNotification = notification;
        
        // Affiche la notification temporaire pendant 5 secondes
        setTimeout(() => {
          this.temporaryNotification = null;
        }, 5000); // 5 secondes
        
        this.updateUnreadCount(); // Met à jour le badge des notifications
      }
    });

    if (policeId) {
      this.notificationService.joinPoliceRoom(policeId);
    }

    this.updateUnreadCount(); // Initialisation
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  updateUnreadCount() {
    this.unreadCount = this.notificationService.getUnreadCount();
  }

  showUnreadNotifications() {
    const unreadNotifications = this.notificationService.getUnreadNotifications();
    if (unreadNotifications.length > 0) {
      // Afficher les notifications dans un modal
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
              </div>
            `).join('')}
          </div>
        `,
        confirmButtonText: 'Fermer'
      }).then(() => {
        // Marque les notifications comme lues
        this.notificationService.clearUnreadNotifications(); 
        this.updateUnreadCount(); // Met à jour le badge
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