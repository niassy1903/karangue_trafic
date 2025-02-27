import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, SidebarComponent, NavbarComponent],
  providers: [UtilisateurService],
})
export class InscriptionComponent implements OnInit {
  inscriptionForm: FormGroup;
  submitted = false;
  errorMessages: { email?: string; telephone?: string } = {};
  isConducteur = false;
  isAgent = false;
  polices: any[] = [];

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {
    this.inscriptionForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^(70|77|76|75|78)[0-9]{7}$')]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      plaque_immatriculation: [''],
      police_id: ['']
    });
  }

  ngOnInit() {
    this.utilisateurService.getPolices().subscribe(
      (data) => {
        this.polices = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des postes de police', error);
      }
    );

    this.inscriptionForm.get('role')?.valueChanges.subscribe(value => {
      this.isConducteur = value === 'conducteur';
      this.isAgent = value === 'agent de sécurité';

      if (this.isConducteur) {
        this.inscriptionForm.get('plaque_immatriculation')?.setValidators([Validators.required, Validators.maxLength(10)]);
      } else {
        this.inscriptionForm.get('plaque_immatriculation')?.clearValidators();
      }

      if (this.isAgent) {
        this.inscriptionForm.get('police_id')?.setValidators([Validators.required]);
      } else {
        this.inscriptionForm.get('police_id')?.clearValidators();
      }

      this.inscriptionForm.get('plaque_immatriculation')?.updateValueAndValidity();
      this.inscriptionForm.get('police_id')?.updateValueAndValidity();
    });
  }

  get f() {
    return this.inscriptionForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.inscriptionForm.invalid) {
      return;
    }

    this.utilisateurService.createUtilisateur(this.inscriptionForm.value).subscribe(
      (response) => {
        Swal.fire('Succès', 'Utilisateur créé avec succès!', 'success').then(() => {
          this.router.navigate(['/utilisateur']);
        });
        this.inscriptionForm.reset();
        this.submitted = false;
      },
      (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          Swal.fire('Erreur', 'Une erreur est survenue. Veuillez réessayer.', 'error');
        }
      }
    );
  }

  goBack() {
    this.router.navigate(['/utilisateur']);
  }
}
