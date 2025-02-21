import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, NavbarComponent],
  providers: [UtilisateurService],
})
export class UtilisateurComponent implements OnInit {
  allUtilisateurs: any[] = []; // Liste complète des utilisateurs
  utilisateurs: any[] = []; // Liste paginée des utilisateurs
  selectedUsers: Set<number> = new Set();
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 3; // Nombre d'éléments par page

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.getUtilisateurs();
  }

  getUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe(
      data => {
        this.allUtilisateurs = data;
        this.totalPages = Math.ceil(this.allUtilisateurs.length / this.itemsPerPage);
        this.updatePaginatedList();
      },
      error => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.utilisateurs = this.allUtilisateurs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  deleteUtilisateur(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous ne pourrez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez-le!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.deleteUtilisateur(id).subscribe(
          response => {
            Swal.fire('Supprimé!', 'L\'utilisateur a été supprimé.', 'success');
            this.getUtilisateurs();
          },
          error => {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
          }
        );
      }
    });
  }

  blockUtilisateur(id: number): void {
    const utilisateur = this.allUtilisateurs.find(u => u.id === id);

    if (!utilisateur) {
      console.error('Utilisateur non trouvé');
      return;
    }

    const action = utilisateur.status === 'actif' ? 'bloquer' : 'débloquer';
    const confirmText = action === 'bloquer' ? 'Oui, bloquez-le!' : 'Oui, débloquez-le!';
    const successMessage = action === 'bloquer' ? 'L\'utilisateur a été bloqué.' : 'L\'utilisateur a été débloqué.';

    Swal.fire({
      title: `Êtes-vous sûr?`,
      text: `Vous allez ${action} cet utilisateur!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.blockUtilisateur(id).subscribe(
          response => {
            Swal.fire('Succès!', successMessage, 'success');
            this.getUtilisateurs();
          },
          error => {
            console.error('Erreur lors du changement de statut de l\'utilisateur', error);
          }
        );
      }
    });
  }

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
      confirmButtonText: 'Oui, supprimez-les!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.deleteMultipleUtilisateurs(Array.from(this.selectedUsers)).subscribe(
          response => {
            Swal.fire('Supprimés!', 'Les utilisateurs ont été supprimés.', 'success');
            this.getUtilisateurs();
            this.selectedUsers.clear();
          },
          error => {
            console.error('Erreur lors de la suppression des utilisateurs', error);
          }
        );
      }
    });
  }

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
      confirmButtonText: 'Oui, bloquez/débloquez-les!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.blockMultipleUtilisateurs(Array.from(this.selectedUsers)).subscribe(
          response => {
            Swal.fire('Succès!', 'Les utilisateurs ont été bloqués/débloqués.', 'success');
            this.getUtilisateurs();
            this.selectedUsers.clear();
          },
          error => {
            console.error('Erreur lors du changement de statut des utilisateurs', error);
          }
        );
      }
    });
  }

  toggleSelection(id: number): void {
    if (this.selectedUsers.has(id)) {
      this.selectedUsers.delete(id);
    } else {
      this.selectedUsers.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedUsers.size === this.utilisateurs.length) {
      this.selectedUsers.clear();
    } else {
      this.utilisateurs.forEach(utilisateur => this.selectedUsers.add(utilisateur.id));
    }
  }

  isSelected(id: number): boolean {
    return this.selectedUsers.has(id);
  }

  redirectToInscription(): void {
    this.router.navigate(['/inscription']);
  }

  redirectToModifier(id: number): void {
    this.router.navigate(['/modifier', id]);
  }
}
