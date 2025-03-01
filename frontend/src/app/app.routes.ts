import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { ModifierComponent } from './components/modifier/modifier.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AmendesComponent } from './components/amendes/amendes.component';
import { HistoriqueAmendesComponent } from './components/historique-amendes/historique-amendes.component';
import { MapComponent } from './components/map/map.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { AgentGuard } from './guard/agent.guard';

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
