import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-modifier',
  templateUrl: './modifier.component.html',
  styleUrls: ['./modifier.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, SidebarComponent, NavbarComponent],
  providers: [UtilisateurService],
})
export class ModifierComponent implements OnInit {
  modifierForm: FormGroup;
  submitted = false;
  errorMessages: { email?: string; telephone?: string } = {};
  utilisateurId!: string;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.modifierForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^(70|77|76|75|78)[0-9]{7}$')]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam !== null) {
        this.utilisateurId = idParam;
        this.getUtilisateur();
      } else {
        console.error('ID de l\'utilisateur non trouvé dans les paramètres de la route.');
      }
    });
  }

  getUtilisateur(): void {
    this.utilisateurService.getUtilisateur(this.utilisateurId).subscribe(
      data => {
        this.modifierForm.patchValue(data);
      },
      error => {
        console.error('Erreur lors de la récupération de l\'utilisateur', error);
      }
    );
  }

  get f() {
    return this.modifierForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.modifierForm.invalid) {
      return;
    }

    this.utilisateurService.updateUtilisateur(this.utilisateurId, this.modifierForm.value).subscribe(
      (response) => {
        Swal.fire({
          title: 'Succès',
          text: 'Utilisateur mis à jour avec succès!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/utilisateur']);
        });
      },
      (error) => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue. Veuillez réessayer.',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      }
    );
  }

  goBack() {
    this.router.navigate(['/utilisateur']);
  }
}
