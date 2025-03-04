import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { AuthService } from '../auth.service';
import { UtilisateurService } from '../utilisateur.service'; // Importez le service UtilisateurService
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Notification {
  police_id: string;
  message: string;
  plaque: string;
  heure: string;
  _id: string;
  infraction_id: string; // Add this line
}

interface Police {
  id: string;
  nom: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [NotificationService, AuthService, UtilisateurService, HttpClientModule,HttpClient],
})
export class NavbarComponent implements OnInit, OnDestroy {
  temporaryNotification: Notification | null = null;
  unreadCount = 0;
  userPrenom: string | null = '';
  userNom: string | null = '';
  userRole: string | null = '';
  private notificationSubscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService // Injectez le service UtilisateurService
  ) {}

  ngOnInit() {
    this.userPrenom = this.authService.getUserPrenom();
    this.userNom = this.authService.getUserNom();
    this.userRole = this.authService.getUserRole();
  
    const policeId = localStorage.getItem('policeId');
  
    // Écoute des notifications et mise à jour du compteur
    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification: any) => {
      if (notification.type === 'updateUnreadCount') {
        this.updateUnreadCount(); // Met à jour le badge des notifications
      } else if (notification.police_id === policeId) {
        this.temporaryNotification = notification;
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
    const unreadNotifications: Notification[] = this.notificationService.getUnreadNotifications();
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
                            <button class="btn btn-transfer" data-notification-id="${notif.infraction_id}">Transférer</button>
                        </div>
                    `).join('')}
                </div>
            `,
            showConfirmButton: false, // Masque le bouton "Fermer"
            didOpen: () => {
                // Attache les événements au bouton "Transférer"
                document.querySelectorAll('.btn-transfer').forEach((button: any) => {
                    button.onclick = (event: any) => {
                        const notificationId = event.target.getAttribute('data-notification-id');
                        if (notificationId) {
                            this.transferNotification(notificationId);
                        }
                    };
                });
            },
            customClass: {
                popup: 'custom-swal-popup', // Appliquez une classe CSS personnalisée pour ajuster la position
            }
        });
    } else {
        Swal.fire({
            title: 'Aucune notification non lue',
            icon: 'info',
            confirmButtonText: 'Fermer'
        });
    }
}



async transferNotification(notificationId: string) {
  const polices: Police[] = await this.utilisateurService.getPolices().toPromise();

  const { value: selectedPoliceId } = await Swal.fire({
    title: 'Sélectionnez une police',
    input: 'select',
    inputOptions: polices.reduce((options: { [key: string]: string }, police) => {
      options[police.id] = police.nom;
      return options;
    }, {}),
    inputPlaceholder: 'Choisissez une unité',
    showCancelButton: true,
  });

  if (selectedPoliceId) {
    this.notificationService.transferNotification(notificationId, selectedPoliceId).subscribe(
      () => {
        Swal.fire({
          title: 'Succès',
          text: 'L\'infraction a été transférée.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.updateUnreadCount(); // Refresh unread count
      },
      () => {
        Swal.fire('Erreur', 'Échec du transfert.', 'error');
      }
    );
  }
}

  
}