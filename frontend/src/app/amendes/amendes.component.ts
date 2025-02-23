import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InfractionService } from '../infraction.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-amendes',
  templateUrl: './amendes.component.html',
  styleUrls: ['./amendes.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, NavbarComponent],
  providers: [InfractionService]
})
export class AmendesComponent implements OnInit {
  amendes: any[] = [];
  showModal: boolean = false;
  currentInfractionId: number | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 5; // Nombre d'éléments par page
  totalInfractions: number = 0; // Total des infractions pour la pagination
  montant: string = '--';
  pages: number[] = []; // Tableau des numéros de pages

  constructor(private infractionService: InfractionService) {}

  ngOnInit(): void {
    this.loadInfractionsForPage(this.currentPage);
    this.loadTotalInfractions(); // Charger le total des infractions
  }

  // Charger le total des infractions
  loadTotalInfractions(): void {
    this.infractionService.getAllInfractions(1, 10).subscribe(data => {
      this.totalInfractions = data.data.length;
      this.totalPages = Math.ceil(this.totalInfractions / this.itemsPerPage); // Calculer le nombre total de pages
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // Générer les pages
    });
  }

  // Charger les infractions pour une page spécifique
  loadInfractionsForPage(page: number): void {
    this.infractionService.getInfractionsWithPagination(page, this.itemsPerPage).subscribe(response => {
      console.log('Data received:', response); // Ajoutez ce log
      this.amendes = response.data.data;
      this.totalInfractions = response.data.total;
      this.totalPages = response.data.last_page;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    });
  }
  
  // Fonction pour changer de page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInfractionsForPage(this.currentPage);
    }
  }

  // Payer une amende
  payAmende(id: number): void {
    this.infractionService.payAmende(id, 35000).subscribe(() => {
      this.loadInfractionsForPage(this.currentPage); // Recharger les infractions après le paiement
    });
  }

  openModal(id: number): void {
    this.showModal = true;
    this.currentInfractionId = id; // Stockez l'ID de l'infraction actuelle
  }

  // Fonction pour fermer le modal
  closeModal(): void {
    this.showModal = false;
  }

  showWavePayment(id: number): void {
    this.closeModal(); // Fermer le modal avant d'afficher le SweetAlert
    Swal.fire({
      title: 'Paiement avec Wave',
      html: `
        <div style="text-align: center;">
          <img src="wave_logo.png" alt="Wave" style="width: 100px; height: auto;">
          <input type="text" id="wave-input" class="swal2-input" placeholder="Saisir le montant...">
        </div>
      `,
      confirmButtonText: 'Confirmer',
      preConfirm: () => {
        const amount = (document.getElementById('wave-input') as HTMLInputElement).value;
        if (!amount) {
          Swal.showValidationMessage('Veuillez saisir un montant.');
        }
        return amount;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Appeler le service pour payer l'amende
        this.infractionService.payAmende(id, parseFloat(result.value)).subscribe(() => {
          Swal.fire('Paiement effectué', 'Le paiement a été enregistré avec succès.', 'success');
          this.loadInfractionsForPage(this.currentPage); // Recharger les infractions après le paiement
        });
      }
    });
  }

  showOrangeMoneyPayment(id: number): void {
    this.closeModal(); // Fermer le modal avant d'afficher le SweetAlert
    Swal.fire({
      title: 'Paiement avec Orange Money',
      html: `
        <div style="text-align: center;">
          <img src="orange_money_logo.jpeg" alt="Orange Money" style="width: 100px; height: auto;">
          <input type="text" id="om-input" class="swal2-input" placeholder="Saisir le montant...">
        </div>
      `,
      confirmButtonText: 'Confirmer',
      preConfirm: () => {
        const amount = (document.getElementById('om-input') as HTMLInputElement).value;
        if (!amount) {
          Swal.showValidationMessage('Veuillez saisir un montant.');
        }
        return amount;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Appeler le service pour payer l'amende
        this.infractionService.payAmende(id, parseFloat(result.value)).subscribe(() => {
          Swal.fire('Paiement effectué', 'Le paiement a été enregistré avec succès.', 'success');
          this.loadInfractionsForPage(this.currentPage); // Recharger les infractions après le paiement
        });
      }
    });
  }

  showCashPayment(id: number): void {
    this.closeModal(); // Fermer le modal avant d'afficher le SweetAlert
    Swal.fire({
      title: 'Paiement en Espèces',
      html: `
        <div style="text-align: center;">
          <img src="espece.png" alt="Espèces" style="width: 100px; height: auto;">
          <input type="text" id="cash-input" class="swal2-input" placeholder="Saisir le montant...">
        </div>
      `,
      confirmButtonText: 'Confirmer',
      preConfirm: () => {
        const amount = (document.getElementById('cash-input') as HTMLInputElement).value;
        if (!amount) {
          Swal.showValidationMessage('Veuillez saisir un montant.');
        }
        return amount;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Appeler le service pour payer l'amende
        this.infractionService.payAmende(id, parseFloat(result.value)).subscribe(() => {
          Swal.fire('Paiement effectué', 'Le paiement a été enregistré avec succès.', 'success');
          this.loadInfractionsForPage(this.currentPage); // Recharger les infractions après le paiement
        });
      }
    });
  }
}
