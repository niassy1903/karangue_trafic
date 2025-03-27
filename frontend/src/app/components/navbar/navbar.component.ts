import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
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
  userTelephone: string | null = '';
  userAdresse: string | null = '';
  userAvatar: string | null = '';
  editProfileForm: FormGroup;
  generateCodeForm: FormGroup;
  roles: string[] = ['Rôle 1', 'Rôle 2', 'Rôle 3']; // Exemple de rôles
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

    this.generateCodeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadUserDetails(userId);
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

    // Initialiser les dropdowns Bootstrap
    setTimeout(() => {
      const dropdownElement = document.getElementById('dropdownMenuButton');
      if (dropdownElement) {
        new bootstrap.Dropdown(dropdownElement);
      }
    }, 500);
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
          <div class="swal2-progress-bar">
            <div class="swal2-progress-bar-inner" style="width: 100%;"></div>
          </div>
        `,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 1000, // 1 seconde
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
        html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
        timerProgressBar: true,
        timer: 1000, // 1 seconde
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
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 1000, // 1 seconde
            showConfirmButton: false
          });
          this.updateUnreadCount();
        },
        () => {
          Swal.fire({
            title: 'Erreur',
            text: 'Échec du transfert.',
            icon: 'error',
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 1000, // 1 seconde
          });
        }
      );
    }
  }

  onEditProfile(event: Event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien ou du bouton

    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.loadUserDetails(userId);

      const modalElement = document.getElementById('editProfileModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  onViewProfile(event: Event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien ou du bouton

    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.loadUserDetails(userId);

      const modalElement = document.getElementById('viewProfileModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  onGenerateSecretCode(event: Event) {
    event.preventDefault(); // Empêche le comportement par défaut du lien ou du bouton

    const modalElement = document.getElementById('generateCodeModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  generateSecretCode() {
    if (this.generateCodeForm.valid) {
      const email = this.generateCodeForm.get('email')?.value;
      this.authService.resetCodeSecret(email).subscribe(
        () => {
          Swal.fire({
            title: 'Succès',
            text: 'Un nouveau code secret a été généré et envoyé à votre email.',
            icon: 'success',
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 500, // 1 seconde
          });
          this.authService.logout(); // Déconnecte l'utilisateur
          const modalElement = document.getElementById('generateCodeModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        },
        (error) => {
          Swal.fire({
            title: 'Erreur',
            text: 'Échec de la génération du code secret.',
            icon: 'error',
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 500, // 1 seconde
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez entrer un email valide.',
        icon: 'error',
        html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
        timerProgressBar: true,
        timer: 500, // 1 seconde
      });
    }
  }

  loadUserDetails(userId: string) {
    this.utilisateurService.getUtilisateur(userId).subscribe((user) => {
      this.userPrenom = user.prenom;
      this.userNom = user.nom;
      this.userRole = user.role;
      this.userEmail = user.email;
      this.userTelephone = user.telephone;
      this.userAdresse = user.adresse;
      this.userAvatar = user.avatar || 'avatarUser.png';

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

  updateProfile() {
    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.utilisateurService.updateUtilisateur(userId, this.editProfileForm.value).subscribe(
        () => {
          Swal.fire({
            title: 'Succès',
            text: 'Profil mis à jour avec succès.',
            icon: 'success',
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 5000, // 1 seconde
          });
          const modalElement = document.getElementById('editProfileModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        },
        (error) => {
          Swal.fire({
            title: 'Erreur',
            text: 'Échec de la mise à jour du profil.',
            icon: 'error',
            html: '<div class="swal2-progress-bar"><div class="swal2-progress-bar-inner" style="width: 100%;"></div></div>',
            timerProgressBar: true,
            timer: 5000, // 1 seconde
          });
        }
      );
    }
  }

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
