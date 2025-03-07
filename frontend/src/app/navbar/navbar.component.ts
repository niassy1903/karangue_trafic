import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { AuthService } from '../auth.service';
import { UtilisateurService } from '../utilisateur.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

declare var bootstrap: any;

interface Notification {
  police_id: string;
  message: string;
  plaque: string;
  heure: string;
  _id: string;
  infraction_id: string;
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
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  providers: [NotificationService, AuthService, UtilisateurService, HttpClientModule, HttpClient],
})
export class NavbarComponent implements OnInit, OnDestroy {
  temporaryNotification: Notification | null = null;
  unreadCount = 0;
  userPrenom: string | null = '';
  userNom: string | null = '';
  userRole: string | null = '';
  userEmail: string | null = '';
  userAdresse: string | null = '';
  userTelephone: string | null = '';
  editProfileForm: FormGroup;
  private notificationSubscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder
  ) {
    this.editProfileForm = this.fb.group({
      prenom: [''],
      nom: [''],
      role: [''],
      email: [''],
      telephone: [''],
      adresse: ['']
    });
  }

  ngOnInit() {
    this.userPrenom = this.authService.getUserPrenom();
    this.userNom = this.authService.getUserNom();
    this.userRole = this.authService.getUserRole();

    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.utilisateurService.getUtilisateur(userId).subscribe((user) => {
        this.editProfileForm.patchValue({
          prenom: user.prenom,
          nom: user.nom,
          role: user.role,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse
        });
      });
    }

    const policeId = localStorage.getItem('policeId');

    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification: any) => {
      if (notification.type === 'updateUnreadCount') {
        this.updateUnreadCount();
      } else if (notification.police_id === policeId) {
        this.temporaryNotification = notification;
        setTimeout(() => {
          this.temporaryNotification = null;
        }, 5000);
        this.updateUnreadCount();
      }
    });

    if (policeId) {
      this.notificationService.joinPoliceRoom(policeId);
    }

    this.updateUnreadCount();
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
        showConfirmButton: false,
        didOpen: () => {
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
          popup: 'custom-swal-popup',
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
          this.updateUnreadCount();
        },
        () => {
          Swal.fire('Erreur', 'Échec du transfert.', 'error');
        }
      );
    }
  }

  onEditProfile() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  }

  onSubmit() {
    if (this.editProfileForm.valid) {
      const userId = localStorage.getItem('utilisateur_id');
      if (userId) {
        this.utilisateurService.updateUtilisateur(userId, this.editProfileForm.value).subscribe(
          () => {
            this.userPrenom = this.editProfileForm.value.prenom;
            this.userNom = this.editProfileForm.value.nom;
            this.userRole = this.editProfileForm.value.role;
            this.userEmail = this.editProfileForm.value.email;
            this.userAdresse = this.editProfileForm.value.adresse;
            this.userTelephone = this.editProfileForm.value.telephone;

            // Fermer le modal
            const modal = document.getElementById('editProfileModal');
            if (modal) {
              const modalInstance = bootstrap.Modal.getInstance(modal);
              modalInstance.hide();
            }
          },
          error => {
            console.error('Erreur lors de la mise à jour du profil', error);
          }
        );
      }
    }
  }

  onViewProfile() {
    const modal = document.getElementById('viewProfileModal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  }

  onGenerateSecretCode() {
    console.log('Générer un code secret');
  }
}
