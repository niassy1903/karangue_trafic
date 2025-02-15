import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige vers /login par défaut
  { path: 'login', component: LoginComponent }, // Route pour la page de connexion
  { path: 'dashboard', component: DashboardComponent } // Route pour la page de tableau de bord
];