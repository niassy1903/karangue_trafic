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
  imports: [CommonModule, HttpClientModule,SidebarComponent,NavbarComponent],
  providers: [UtilisateurService],
})
export class UtilisateurComponent implements OnInit {
  utilisateurs: any[] = [];
  selectedUsers: Set<number> = new Set();

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  ngOnInit(): void {
    this.getUtilisateurs();
  }

  getUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe(
      data => {
        this.utilisateurs = data;
      },
      error => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
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
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous allez bloquer cet utilisateur!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, bloquez-le!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.utilisateurService.blockUtilisateur(id).subscribe(
          response => {
            Swal.fire('Bloqué!', 'L\'utilisateur a été bloqué.', 'success');
            this.getUtilisateurs();
          },
          error => {
            console.error('Erreur lors du blocage de l\'utilisateur', error);
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

  toggleSelection(id: number): void {
    if (this.selectedUsers.has(id)) {
      this.selectedUsers.delete(id);
    } else {
      this.selectedUsers.add(id);
    }
  }

  // Méthode pour rediriger vers le composant d'inscription
  redirectToInscription(): void {
    this.router.navigate(['/inscription']);
  }

  // Méthode pour rediriger vers le composant de modification
  redirectToModifier(id: number): void {
    this.router.navigate(['/modifier', id]);
  }
}