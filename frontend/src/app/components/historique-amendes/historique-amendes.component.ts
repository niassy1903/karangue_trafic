import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HistoriquePaiementService } from '../../services/historique-paiement.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx'; // Importer la bibliothèque xlsx
import Swal from 'sweetalert2';

interface Historique {
  id: string;
  plaque_matriculation: string;
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
  imports: [HttpClientModule, SidebarComponent, NavbarComponent, CommonModule, NgxPaginationModule, FormsModule],
  providers: [HistoriquePaiementService, HttpClientModule, HttpClient]
})
export class HistoriqueAmendesComponent implements OnInit {
  historiques: Historique[] = [];
  filteredHistoriques: Historique[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  searchQuery: string = '';
  searchDate: string = '';
  selectedMonth: string = '';
  prenom: string = '';
  nom: string = '';
  noResultsMessage: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    private historiquePaiementService: HistoriquePaiementService,
    private authService: AuthService
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
        const plaqueMatriculation = item.infraction ? item.infraction.plaque_matriculation : 'Inconnu';
        return {
          plaque_matriculation: plaqueMatriculation,
          prenom: this.prenom,
          nom: this.nom,
          date: item.date,
          montant: item.montant || 0,
          heure: item.heure,
          action: item.action,
          
        };
      });
      this.filterHistoriques();
    });
  }

  filterByName() {
    return this.historiques.filter(historique =>
      historique.plaque_matriculation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      historique.prenom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      historique.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  filterByDate() {
    return this.historiques.filter(historique => {
      if (this.searchDate === '') return true;

      // Convertir la date du champ input (aaaa-mm-jj) en jj/mm/aaaa
      const [year, month, day] = this.searchDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      return historique.date === formattedDate;
    });
  }

 filterHistoriques() {
  const nameFiltered = this.filterByName();
  const dateFiltered = this.filterByDate();

  // Combine the results of both filters
  this.filteredHistoriques = nameFiltered.filter(historique =>
    dateFiltered.includes(historique)
  );

  if (this.filteredHistoriques.length === 0 && (this.searchQuery.trim() !== '' || this.searchDate !== '')) {
    this.noResultsMessage = `Aucun résultat trouvé pour "${this.searchQuery}" et la date "${this.searchDate}".`;
  } else {
    this.noResultsMessage = '';
  }

  this.totalPages = Math.ceil(this.filteredHistoriques.length / 10); // Mettre à jour pour 5 éléments par page
}



  clearSearch() {
    this.searchQuery = '';
    this.searchDate = '';
    this.selectedMonth = '';
    this.filterHistoriques();
  }

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value;
    this.filterHistoriques();
  }

  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchDate = inputElement.value;
    this.filterHistoriques();
  }

  onMonthChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedMonth = selectElement.value;
  }

  exportToExcel() {
    if (this.selectedMonth === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner un mois pour exporter les données.',
      });
      return;
    }

    // Vérifier si le format de selectedMonth est valide (mm/aaaa)
    const dateParts = this.selectedMonth.split('/');
    if (dateParts.length !== 2) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Le format du mois sélectionné est invalide. Veuillez utiliser le format mm/aaaa.',
      });
      return;
    }

    const [month, year] = dateParts;
    if (
      !month ||
      !year ||
      isNaN(Number(month)) ||
      isNaN(Number(year)) ||
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Le format du mois sélectionné est invalide. Veuillez utiliser le format mm/aaaa.',
      });
      return;
    }

    // Filtrer les données par mois et année
    const monthData = this.filteredHistoriques.filter(historique => {
      const [historiqueDay, historiqueMonth, historiqueYear] = historique.date.split('/');
      return historiqueMonth === month && historiqueYear === year;
    });

    if (monthData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune donnée',
        text: `Aucune donnée trouvée pour le mois ${month}/${year}.`,
      });
      return;
    }

    // Exporter les données en Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(monthData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Amendes_${month}_${year}`);

    XLSX.writeFile(wb, `Amendes_${month}_${year}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Exportation réussie',
      text: `Les données pour le mois ${month}/${year} ont été exportées avec succès.`,
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
