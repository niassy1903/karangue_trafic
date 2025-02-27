import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { AuthService } from '../auth.service';
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
  userPrenom: string | null = ''; // ✅ Stocker le prénom
  userNom: string | null = ''; // ✅ Stocker le nom
  userRole: string | null = ''; // ✅ Stocker le rôle
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService, private authService: AuthService) {}

  ngOnInit() {
    this.userPrenom = this.authService.getUserPrenom();
    this.userNom = this.authService.getUserNom();
    this.userRole = this.authService.getUserRole();
  
    const policeId = localStorage.getItem('policeId'); // ✅ Récupérer la police de l'agent connecté
  
    // Gestion des notifications
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification) => {
      if (notification.police_id === policeId) { // ✅ Vérifier si l'infraction concerne cette police
        this.temporaryNotification = notification;
        setTimeout(() => {
          this.temporaryNotification = null;
        }, 10000);
        this.unreadCount++;
      }
    });
  
    // Rejoindre la salle de la police spécifique
    if (policeId) {
      this.notificationService.joinPoliceRoom(policeId);
    }
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
              </div>
            `).join('')}
          </div>
        `,
        confirmButtonText: 'Fermer'
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
