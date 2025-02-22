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
  imports: [CommonModule, HttpClientModule,SidebarComponent,NavbarComponent],
  providers: [InfractionService]
})
export class AmendesComponent implements OnInit {
  amendes: any[] = [];
  showModal: boolean = false;
  currentInfractionId: number | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10; // Nombre d'éléments par page
  montant : string = '--';

  constructor(private infractionService: InfractionService) {}

  ngOnInit(): void {
    this.loadInfractionsForPage(this.currentPage);
  }

  // Charger les infractions pour une page spécifique
  loadInfractionsForPage(page: number): void {
    this.infractionService.getAllInfractions().subscribe(response => {
      this.amendes = response.data;
      this.totalPages = response.totalPages;
    });
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

  // Fonction pour changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInfractionsForPage(this.currentPage);
    }
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
