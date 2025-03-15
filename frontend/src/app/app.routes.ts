import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { ModifierComponent } from './modifier/modifier.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AmendesComponent } from './amendes/amendes.component';
import { HistoriqueAmendesComponent } from './historique-amendes/historique-amendes.component';
import { MapComponent } from './map/map.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './auth.guard';
import { AgentGuard } from './agent.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Page par défaut

  { path: 'login', component: LoginComponent }, // Page de connexion
  
  // Routes accessibles uniquement aux administrateurs
  { path: 'utilisateur', component: UtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AgentGuard] },
  { path: 'inscription', component: InscriptionComponent, canActivate: [AuthGuard] },
  { path: 'modifier/:id', component: ModifierComponent, canActivate: [AuthGuard] },
  { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard] },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  { path: 'map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },

  // Routes accessibles uniquement aux agents de sécurité
  { path: 'amendes', component: AmendesComponent, canActivate: [AgentGuard] },
  { path: 'historique-amendes', component: HistoriqueAmendesComponent, canActivate: [AgentGuard] },

  { path: 'accueil', component: DashboardComponent,canActivate:[AgentGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }