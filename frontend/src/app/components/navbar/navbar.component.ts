import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule],
  providers: [NotificationService, AuthService, UtilisateurService],
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
  roles: string[] = ['Rôle 1', 'Rôle 2', 'Rôle 3'];
  private notificationSubscription!: Subscription;
  private readonly notificationSound = new Audio('/sounds/alert.mp3');
  searchQuery: string = '';
  searchResults: any[] = [];
  isDropdownOpen = false;
  showEditProfileModal: boolean = false;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly utilisateurService: UtilisateurService,
    private readonly fb: FormBuilder
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
    if (userId) this.loadUserDetails(userId);

    const policeId = localStorage.getItem('policeId');
    if (policeId) this.notificationService.joinPoliceRoom(policeId);

    this.notificationSubscription = this.notificationService.getNotifications().subscribe((notification: any) => {
      if (notification.type === 'updateUnreadCount') {
        this.updateUnreadCount();
      } else if (notification.police_id === policeId) {
        this.temporaryNotification = notification;
        this.playNotificationSound();
        this.speakNotification(notification.message, notification.plaque);
        setTimeout(() => this.temporaryNotification = null, 5000);
        this.updateUnreadCount();
      }
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
  }

  playNotificationSound() {
    const playSound = () => {
      this.notificationSound.pause();
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(err => {
        console.error('Erreur lors de la lecture du son :', err);
      });
    };

    if (document.readyState === 'complete') {
      playSound();
    } else {
      window.addEventListener('click', playSound, { once: true });
    }
  }

  updateUnreadCount() {
    this.unreadCount = this.notificationService.getUnreadCount();
  }

  speakNotification(message: string, plaque: string) {
    const fullMessage = `Vous avez une nouvelle notification. Une voiture a commis une infraction. Plaque d'immatriculation : ${plaque}. ${message}`;

    const utterance = new SpeechSynthesisUtterance(fullMessage);
    utterance.lang = 'fr-FR'; // Langue française
    utterance.rate = 1; // Vitesse normale
    utterance.pitch = 1; // Tonalité normale
    window.speechSynthesis.speak(utterance);
  }

  showCustomNotificationDialog(message: string, plaque: string, heure: string, notificationId: string) {
    Swal.fire({
      title: '<strong>Nouvelle Alerte</strong>',
      icon: 'warning',
      html: `
        <div class="custom-notification-content">
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Plaque:</strong> ${plaque}</p>
          <p><strong>Heure:</strong> ${heure}</p>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Ouvrir la notification',
      confirmButtonAriaLabel: 'Ouvrir la notification',
      cancelButtonText: '<i class="fa fa-thumbs-down"></i> Fermer',
      cancelButtonAriaLabel: 'Fermer',
      showDenyButton: true,
      denyButtonText: '<i class="fa fa-share"></i> Transférer',
      denyButtonAriaLabel: 'Transférer la notification',
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
        denyButton: 'custom-swal-deny-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Notification ouverte');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log('Notification fermée');
      } else if (result.isDenied) {
        this.transferNotification(notificationId);
      }
    });
  }

  showUnreadNotifications() {
    const unreadNotifications: Notification[] = this.notificationService.getUnreadNotifications();
    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach(notification => {
        this.showCustomNotificationDialog(
          notification.message,
          notification.plaque,
          notification.heure,
          notification.infraction_id
        );
      });
      
    } else {
      Swal.fire({
        title: 'Aucune notification non lue',
        icon: 'info',
        timer: 1000,
        timerProgressBar: true,
      });
    }
  }

  async transferNotification(notificationId: string) {
    this.playNotificationSound();
    const polices: Police[] = await this.utilisateurService.getPolices().toPromise();

    const { value: selectedPoliceId } = await Swal.fire({
      title: '<strong>Transférer la notification</strong>',
      icon: 'info',
      html: `
        <div class="custom-swal-content">
          <p>Sélectionnez la police à laquelle vous souhaitez transférer cette notification.</p>
        </div>
      `,
      input: 'select',
      inputOptions: polices.reduce((opt: any, p) => {
        opt[p.id] = p.nom;
        return opt;
      }, {}),
      inputPlaceholder: 'Choisissez une unité',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-check"></i> Transférer',
      cancelButtonText: '<i class="fa fa-times"></i> Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
        input: 'custom-swal-input'
      }
    });

    if (selectedPoliceId) {
      this.notificationService.transferNotification(notificationId, selectedPoliceId).subscribe(
        () => {
          Swal.fire({
            title: '<strong>Succès</strong>',
            html: '<p>Infraction transférée avec succès !</p>',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm-button'
            }
          });
          this.updateUnreadCount();
        },
        () => {
          Swal.fire({
            title: '<strong>Erreur</strong>',
            html: '<p>Échec du transfert de l\'infraction.</p>',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm-button'
            }
          });
        }
      );
    }
  }

  onEditProfile(event: Event): void {
    event.preventDefault();
    this.showEditProfileModal = true;
    this.closeDropdown();
  }

  onViewProfile(event: Event) {
    event.preventDefault();
    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.loadUserDetails(userId);
      const modalEl = document.getElementById('viewProfileModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    }
  }

  onGenerateSecretCode(event: Event) {
    event.preventDefault();
    const modalEl = document.getElementById('generateCodeModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  generateSecretCode() {
    if (this.generateCodeForm.valid) {
      const email = this.generateCodeForm.get('email')?.value;
      this.authService.resetCodeSecret(email).subscribe(
        () => {
          Swal.fire({
            title: 'Succès',
            text: 'Code secret envoyé à votre email.',
            icon: 'success',
            timer: 500,
            timerProgressBar: true
          });
          this.authService.logout();
          const modalEl = document.getElementById('generateCodeModal');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        },
        () => {
          Swal.fire({
            title: 'Erreur',
            text: 'Échec de la génération du code.',
            icon: 'error',
            timer: 500,
            timerProgressBar: true
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Erreur',
        text: 'Veuillez entrer un email valide.',
        icon: 'error',
        timer: 500,
        timerProgressBar: true
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
      this.editProfileForm.patchValue(user);
    });
  }

  updateProfile() {
    const userId = localStorage.getItem('utilisateur_id');
    if (userId) {
      this.utilisateurService.updateUtilisateur(userId, this.editProfileForm.value).subscribe(
        () => {
          Swal.fire({
            title: 'Succès',
            text: 'Profil mis à jour.',
            icon: 'success',
            timer: 5000,
            timerProgressBar: true
          });
          const modalEl = document.getElementById('editProfileModal');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        },
        () => {
          Swal.fire({
            title: 'Erreur',
            text: 'Mise à jour échouée.',
            icon: 'error',
            timer: 5000,
            timerProgressBar: true
          });
        }
      );
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  performGlobalSearch() {
    this.utilisateurService.globalSearch(this.searchQuery).subscribe(
      (results) => this.searchResults = results,
      (error) => console.error('Erreur recherche globale', error)
    );
  }
}
