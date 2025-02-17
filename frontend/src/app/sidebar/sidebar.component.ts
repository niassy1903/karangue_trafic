import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  currentRoute: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  navigateTo(route: string) {
    this.currentRoute = route; // Met à jour l'URL active
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
  }
}