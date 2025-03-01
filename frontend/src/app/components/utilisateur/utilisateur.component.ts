import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, NavbarComponent, FormsModule],
  providers: [UtilisateurService],
})
export class UtilisateurComponent implements OnInit {
  allUtilisateurs: any[] = []; // Tous les utilisateurs
  utilisateurs: any[] = []; // Utilisateurs affichés (après filtrage/pagination)
  selectedUsers: Set<number> = new Set(); // Utilisateurs sélectionnés
  currentPage: number = 1; // Page actuelle
  totalPages: number = 1; // Nombre total de pages
  itemsPerPage: number = 3; // Nombre d'éléments par page
  searchTerm: string = ''; // Terme de recherche
  noResults: boolean = false; // Aucun résultat trouvé
  selectedRole: string = ''; // Rôle sélectionné pour le filtrage
  filteredUtilisateurs: any[] = [];


  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.getUtilisateurs();
  }

  // Récupérer tous les utilisateurs
  getUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe(
      (data) => {
        this.allUtilisateurs = data;
        this.applyFilters(); // Appliquer les filtres après le chargement
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }


  // Changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  // Filtrer les utilisateurs par matricule et rôle
  // Remplacer la méthode filterUsers() par :
applyFilters(): void {
  let filteredUsers = this.allUtilisateurs;

  // Filtrage par terme de recherche
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.matricule.toLowerCase().includes(term) ||
      user.prenom.toLowerCase().includes(term) ||
      user.nom.toLowerCase().includes(term)
    );
  }

  // Filtrage par rôle
  if (this.selectedRole) {
    filteredUsers = filteredUsers.filter(user => 
      user.role.toLowerCase() === this.selectedRole.toLowerCase()
    );
  }

  this.filteredUtilisateurs = filteredUsers;
  this.totalPages = Math.ceil(this.filteredUtilisateurs.length / this.itemsPerPage);
  this.currentPage = 1; // Réinitialiser à la première page
  this.updatePaginatedList();
  this.noResults = this.filteredUtilisateurs.length === 0;
}

// Modifier updatePaginatedList()
updatePaginatedList(): void {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  this.utilisateurs = this.filteredUtilisateurs.slice(startIndex, startIndex + this.itemsPerPage);
}

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous ne pourrez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez-le!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.deleteUtilisateur(id).subscribe(
          (response) => {
            Swal.fire({
              title: 'Supprimé!',
              text: 'L\'utilisateur a été supprimé.',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.getUtilisateurs();
          },
          (error) => {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
          }
        );
      }
    });
  }

  // Bloquer/Débloquer un utilisateur
  blockUtilisateur(id: number): void {
    const utilisateur = this.allUtilisateurs.find((u) => u.id === id);

    if (!utilisateur) {
      console.error('Utilisateur non trouvé');
      return;
    }

    const action = utilisateur.status === 'actif' ? 'bloquer' : 'débloquer';
    const confirmText = action === 'bloquer' ? 'Oui, bloquez-le!' : 'Oui, débloquez-le!';
    const successMessage =
      action === 'bloquer' ? 'L\'utilisateur a été bloqué.' : 'L\'utilisateur a été débloqué.';

    Swal.fire({
      title: `Êtes-vous sûr?`,
      text: `Vous allez ${action} cet utilisateur!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.blockUtilisateur(id).subscribe(
          (response) => {
            Swal.fire({
              title: 'Succès!',
              text: successMessage,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.getUtilisateurs();
          },
          (error) => {
            console.error('Erreur lors du changement de statut de l\'utilisateur', error);
          }
        );
      }
    });
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUtilisateurs(): void {
    if (this.selectedUsers.size === 0) {
      Swal.fire({
        title: 'Aucun utilisateur sélectionné',
        icon: 'warning',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous ne pourrez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez-les!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.deleteMultipleUtilisateurs(Array.from(this.selectedUsers)).subscribe(
          (response) => {
            Swal.fire({
              title: 'Supprimés!',
              text: 'Les utilisateurs ont été supprimés.',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.getUtilisateurs();
            this.selectedUsers.clear();
          },
          (error) => {
            console.error('Erreur lors de la suppression des utilisateurs', error);
          }
        );
      }
    });
  }

  // Bloquer/Débloquer plusieurs utilisateurs
  blockMultipleUtilisateurs(): void {
    if (this.selectedUsers.size === 0) {
      Swal.fire({
        title: 'Aucun utilisateur sélectionné',
        icon: 'warning',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous allez bloquer/débloquer les utilisateurs sélectionnés!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, bloquez/débloquez-les!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.blockMultipleUtilisateurs(Array.from(this.selectedUsers)).subscribe(
          (response) => {
            Swal.fire({
              title: 'Succès!',
              text: 'Les utilisateurs ont été bloqués/débloqués.',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.getUtilisateurs();
            this.selectedUsers.clear();
          },
          (error) => {
            console.error('Erreur lors du changement de statut des utilisateurs', error);
          }
        );
      }
    });
  }

  // Sélectionner/Désélectionner un utilisateur
  toggleSelection(id: number): void {
    if (this.selectedUsers.has(id)) {
      this.selectedUsers.delete(id);
    } else {
      this.selectedUsers.add(id);
    }
  }

  // Sélectionner/Désélectionner tous les utilisateurs
  toggleSelectAll(): void {
    if (this.selectedUsers.size === this.utilisateurs.length) {
      this.selectedUsers.clear();
    } else {
      this.utilisateurs.forEach((utilisateur) => this.selectedUsers.add(utilisateur.id));
    }
  }

  // Vérifier si un utilisateur est sélectionné
  isSelected(id: number): boolean {
    return this.selectedUsers.has(id);
  }

  // Rediriger vers la page d'inscription
  redirectToInscription(): void {
    this.router.navigate(['/inscription']);
  }

  // Rediriger vers la page de modification
  redirectToModifier(id: number): void {
    this.router.navigate(['/modifier', id]);
  }

  // Importer des utilisateurs via CSV
  importCsv(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('csv_file', file);

      this.utilisateurService.importCsv(formData).subscribe(
        (response) => {
          Swal.fire({
            title: 'Succès!',
            text: 'Importation réussie!',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          this.getUtilisateurs();
        },
        (error) => {
          Swal.fire({
            title: 'Erreur!',
            text: 'L\'importation a échoué.',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          console.error('Erreur lors de l\'importation des utilisateurs', error);
        }
      );
    } else {
      Swal.fire({
        title: 'Erreur!',
        text: 'Veuillez sélectionner un fichier CSV.',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  }

  // Assigner une carte à un utilisateur
  assignCard(id: number): void {
    // Afficher le modal avec l'input désactivé
    Swal.fire({
      title: 'Assigner une carte',
      html: `
        <img src="scanne.png" alt="Scan Image" style="width: 100px; height: 100px;">
        <input type="text" id="cardId" class="swal2-input" placeholder="Scan en cours..." disabled>
      `,
      showCancelButton: true,
      confirmButtonText: 'Assigner',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      allowOutsideClick: false, // Empêcher la fermeture du modal en cliquant à l'extérieur
      didOpen: () => {
        // Établir une connexion SSE avec le serveur
        const eventSource = new EventSource('http://localhost:3000/sse');
  
        // Écouter les événements du serveur
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
  
          if (data.uid) {
            const cardIdInput = document.getElementById('cardId') as HTMLInputElement;
            if (cardIdInput) {
              cardIdInput.value = data.uid; // Pré-remplir l'input avec l'UID
              cardIdInput.disabled = false; // Activer l'input
              cardIdInput.placeholder = 'UID scanné'; // Changer le placeholder
            }
          }
        };
  
        // Fermer la connexion SSE lorsque le modal est fermé
        Swal.getPopup()?.addEventListener('close', () => {
          eventSource.close();
        });
      },
      preConfirm: () => {
        const cardId = (document.getElementById('cardId') as HTMLInputElement).value;
        if (!cardId) {
          Swal.showValidationMessage('Veuillez scanner une carte RFID.');
        }
        return cardId;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const cardId = result.value;
  
        // Appeler la méthode du service pour assigner la carte
        this.utilisateurService.assignCard(id, cardId).subscribe(
          (response) => {
            Swal.fire({
              title: 'Succès!',
              text: 'Carte assignée avec succès.',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.getUtilisateurs();
          },
          (error) => {
            Swal.fire({
              title: 'Erreur!',
              text: 'L\'assignation de la carte a échoué.',
              icon: 'error',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            console.error('Erreur lors de l\'assignation de la carte', error);
          }
        );
      }
    });
  }
}
