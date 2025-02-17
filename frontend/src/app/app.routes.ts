import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { ModifierComponent } from './modifier/modifier.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [


  {path : 'utilisateur', component: UtilisateurComponent},
  {path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard] // Protéger la route
  },  {path : 'inscription', component : InscriptionComponent},
  { path: 'modifier/:id', component: ModifierComponent },
  {path:'login',component: LoginComponent},
  {path:'accueil',component:DashboardComponent},
  {path:'sidebar',component:SidebarComponent},
  {path:'navbar',component: NavbarComponent},
];
