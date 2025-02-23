import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HistoriquePaiementService } from '../historique-paiement.service';
import { NgxPaginationModule } from 'ngx-pagination';

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
  imports: [HttpClientModule, SidebarComponent, NavbarComponent, CommonModule, NgxPaginationModule],
  providers: [HistoriquePaiementService]
})
export class HistoriqueAmendesComponent implements OnInit {
  historiques: Historique[] = [];
  currentPage: number = 1;
  totalPages: number = 1; // Initialisez à 1 pour éviter les erreurs de pagination

  constructor(private historiquePaiementService: HistoriquePaiementService) {}

  ngOnInit() {
    this.loadHistoriquePaiements();
  }

  loadHistoriquePaiements() {
    this.historiquePaiementService.getHistoriquePaiements().subscribe(data => {
      this.historiques = data.data.map((item: any) => ({
        id: item._id,
        matricule: item.infraction.plaque_matriculation,
        prenom: item.utilisateur.prenom,
        nom: item.utilisateur.nom,
        date: item.date,
        heure: item.heure,
        action: item.action
      }));
      this.totalPages = Math.ceil(this.historiques.length / 10); // Exemple de calcul de pagination
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}