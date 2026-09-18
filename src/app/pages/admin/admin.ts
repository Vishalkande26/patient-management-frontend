
import { Component, inject } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',

  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ButtonModule
  ],

  templateUrl: './admin.html',

  styleUrl: './admin.scss'
})
export class Admin {

  private router = inject(Router);

  private authService = inject(AuthService);

  get username(): string {

    return this.authService.getUsername() ?? 'Admin';

  }

  get isDashboard(): boolean {

    return (
      this.router.url === '/admin' ||
      this.router.url === '/admin/'
    );

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

  goToDashboard(): void {

    this.router.navigate([
      '/admin'
    ]);

  }

  goToPatients(): void {

    this.router.navigate([
      '/admin/patients'
    ]);

  }

  goToDoctors(): void {

    this.router.navigate([
      '/admin/doctors'
    ]);

  }

  goToUsers(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }

  goToAppointments(): void {

    this.router.navigate([
      '/admin/appointments'
    ]);

  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}

