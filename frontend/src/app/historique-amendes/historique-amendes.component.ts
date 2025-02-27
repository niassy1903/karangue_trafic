import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HistoriquePaiementService } from '../historique-paiement.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../auth.service'; // Assurez-vous d'importer AuthService

interface Historique {
  id: string;
  plaque_matriculation : string;
  prenom: string;
  nom: string;
  date: string;
  heure: string;
  action: string;
  montant: number;
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
  filteredHistoriques: Historique[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  searchQuery: string = '';
  prenom: string = '';
  nom: string = '';

  constructor(
    private historiquePaiementService: HistoriquePaiementService,
    private authService: AuthService // Injecter AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadHistoriquePaiements();
  }

  loadUserInfo() {
    this.prenom = this.authService.getUserPrenom() || 'Inconnu';
    this.nom = this.authService.getUserNom() || 'Inconnu';
  }

  
  loadHistoriquePaiements() {
    this.historiquePaiementService.getHistoriquePaiements().subscribe(data => {
      this.historiques = data.data.map((item: any) => {
        // Vérifiez si l'infraction et plaque_matriculation existent
        const plaqueMatriculation = item.infraction ? item.infraction.plaque_matriculation : 'Inconnu';
        return {
          id: item._id,
          plaque_matriculation: plaqueMatriculation,
          prenom: this.prenom, // Utiliser le prénom de l'utilisateur connecté
          nom: this.nom, // Utiliser le nom de l'utilisateur connecté
          date: item.date,
          heure: item.heure,
          action: item.action,
          montant: item.montant || 0 // Utilisation du montant si disponible
        };
      });
      this.filterHistoriques();
    });
  }
  

  filterHistoriques() {
    this.filteredHistoriques = this.historiques.filter(historique =>
      historique.plaque_matriculation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      historique.prenom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      historique.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.totalPages = Math.ceil(this.filteredHistoriques.length / 10);
  }

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value;
    this.filterHistoriques();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
