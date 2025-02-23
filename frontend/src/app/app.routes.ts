import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { ModifierComponent } from './modifier/modifier.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthGuard } from './auth.guard';
import { AmendesComponent } from './amendes/amendes.component';
import { HistoriqueAmendesComponent } from './historique-amendes/historique-amendes.component';
import { MapComponent } from './map/map.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Page par défaut

  { path: 'login', component: LoginComponent }, // Page de connexion
  
  { path: 'utilisateur', component: UtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'inscription', component: InscriptionComponent, canActivate: [AuthGuard] },
  { path: 'modifier/:id', component: ModifierComponent, canActivate: [AuthGuard] },
  { path: 'accueil', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard] },
  { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
  {path:'amendes',component:AmendesComponent,canActivate: [AuthGuard]},
  {path:'historiques-amendes',component:HistoriqueAmendesComponent, canActivate :[AuthGuard]},
  {path:'map',component:MapComponent,canActivate: [AuthGuard]}
];
