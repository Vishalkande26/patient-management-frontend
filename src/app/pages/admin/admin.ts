import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private router = inject(Router);
  private authService = inject(AuthService);

  get username(): string {
    return this.authService.getUsername() ?? 'Admin';
  }

  get pageTitle(): string {

    const url = this.router.url;

    if (url.includes('/doctors')) {
      return 'Manage Doctors';
    }

    if (url.includes('/patients')) {
      return 'Manage Patients';
    }

    if (url.includes('/users')) {
      return 'Manage Users';
    }

    if (url.includes('/appointments')) {
      return 'Manage Appointments';
    }

    return 'Admin Dashboard';
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}