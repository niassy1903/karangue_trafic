import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../utilisateur.service';
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

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.getUtilisateurs();
  }

  // Récupérer tous les utilisateurs
  getUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe(
      (data) => {
        this.allUtilisateurs = data;
        this.totalPages = Math.ceil(this.allUtilisateurs.length / this.itemsPerPage);
        this.updatePaginatedList();
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  // Mettre à jour la liste paginée
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.utilisateurs = this.allUtilisateurs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  // Filtrer les utilisateurs par matricule et rôle
  filterUsers(): void {
    let filteredUsers = this.allUtilisateurs;

    // Filtrage par matricule
    if (this.searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.matricule.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrage par rôle
    if (this.selectedRole) {
      filteredUsers = filteredUsers.filter(
        (user) => user.role.toLowerCase() === this.selectedRole.toLowerCase()
      );
    }

    this.utilisateurs = filteredUsers;
    this.noResults = this.utilisateurs.length === 0;
    this.updatePaginatedList();
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
            Swal.fire('Supprimé!', 'L\'utilisateur a été supprimé.', 'success');
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
            Swal.fire('Succès!', successMessage, 'success');
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
      Swal.fire('Aucun utilisateur sélectionné', '', 'warning');
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
            Swal.fire('Supprimés!', 'Les utilisateurs ont été supprimés.', 'success');
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
      Swal.fire('Aucun utilisateur sélectionné', '', 'warning');
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
            Swal.fire('Succès!', 'Les utilisateurs ont été bloqués/débloqués.', 'success');
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
          Swal.fire('Succès!', 'Importation réussie!', 'success');
          this.getUtilisateurs();
        },
        (error) => {
          Swal.fire('Erreur!', 'L\'importation a échoué.', 'error');
          console.error('Erreur lors de l\'importation des utilisateurs', error);
        }
      );
    } else {
      Swal.fire('Erreur!', 'Veuillez sélectionner un fichier CSV.', 'error');
    }
  }

  // Assigner une carte à un utilisateur
  assignCard(id: number): void {
    Swal.fire({
      title: 'Assigner une carte',
      html: `
        <img src="scanne.png" alt="Scan Image" style="width: 100px; height: 100px;">
        <input type="text" id="cardId" class="swal2-input" placeholder="Entrez l'ID de la carte">
      `,
      showCancelButton: true,
      confirmButtonText: 'Assigner',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const cardId = (document.getElementById('cardId') as HTMLInputElement).value;
        if (!cardId) {
          Swal.showValidationMessage('Veuillez entrer l\'ID de la carte');
        }
        return cardId;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const cardId = result.value;
        this.utilisateurService.assignCard(id, cardId).subscribe(
          (response) => {
            Swal.fire('Succès!', 'Carte assignée avec succès.', 'success');
            this.getUtilisateurs();
          },
          (error) => {
            Swal.fire('Erreur!', 'L\'assignation de la carte a échoué.', 'error');
            console.error('Erreur lors de l\'assignation de la carte', error);
          }
        );
      }
    });
  }
}