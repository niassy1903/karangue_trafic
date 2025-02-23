import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

interface Historique {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  date: string;
  heure: string;
  action: string;
}

@Component({
  selector: 'app-historique-amendes',
  templateUrl: './historique-amendes.component.html',
  styleUrls: ['./historique-amendes.component.css'],
  standalone: true,
  imports : [HttpClientModule,SidebarComponent,NavbarComponent,CommonModule]
})
export class HistoriqueAmendesComponent {
  // Données fictives
  historiques: Historique[] = [
    { id: '1', matricule: 'AA123CD', prenom: 'Jean', nom: 'Cooper', date: '21/09/2021', heure: '12:00', action: 'créer un utilisateur' },
    { id: '2', matricule: 'BB456EF', prenom: 'Wade', nom: 'Warren', date: '05/07/2016', heure: '14:15', action: 'supprimer un utilisateur' },
    { id: '3', matricule: 'CC789GH', prenom: 'Esther', nom: 'Howard', date: '09/08/2016', heure: '15:00', action: 'supprimer un utilisateur' },
    { id: '4', matricule: 'DD234IJ', prenom: 'Cameron', nom: 'Williamson', date: '22/11/2012', heure: '15:45', action: 'supprimer un utilisateur' },
    { id: '5', matricule: 'EE567KL', prenom: 'Brooklyn', nom: 'Simmons', date: '09/08/2016', heure: '10:00', action: 'supprimer un utilisateur' },
    { id: '6', matricule: 'FF890MN', prenom: 'Leslie', nom: 'Alexander', date: '01/02/2017', heure: '16:03', action: 'mettre à jour un utilisateur' },
    { id: '7', matricule: 'GG123OP', prenom: 'Jenny', nom: 'Wilson', date: '05/27/2015', heure: '18:09', action: 'bloquer un utilisateur' },
    { id: '8', matricule: 'HH456PQ', prenom: 'Guy', nom: 'Hawkins', date: '08/02/2019', heure: '17:00', action: 'assigner une carte' }
  ];

  currentPage: number = 1;
  totalPages: number = 4; // Exemple de nombre total de pages

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
