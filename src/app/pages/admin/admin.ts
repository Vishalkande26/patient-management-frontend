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

    // PrimeNG
    ButtonModule
  ],

  templateUrl: './admin.html',

  styleUrl: './admin.css'
})
export class Admin {

  private router = inject(Router);

  private authService = inject(AuthService);


  // ==========================================
  // USERNAME
  // ==========================================

  get username(): string {

    return this.authService.getUsername() ?? 'Admin';

  }


  // ==========================================
  // CHECK ADMIN DASHBOARD
  // ==========================================

  get isDashboard(): boolean {

    return (
      this.router.url === '/admin' ||
      this.router.url === '/admin/'
    );

  }


  // ==========================================
  // PAGE TITLE
  // ==========================================

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


  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  goToDashboard(): void {

    this.router.navigate([
      '/admin'
    ]);

  }


  // ==========================================
  // PATIENT MANAGEMENT
  // ==========================================

  goToPatients(): void {

    this.router.navigate([
      '/admin/patients'
    ]);

  }


  // ==========================================
  // DOCTOR MANAGEMENT
  // ==========================================

  goToDoctors(): void {

    this.router.navigate([
      '/admin/doctors'
    ]);

  }


  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  goToUsers(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }


  // ==========================================
  // APPOINTMENT MANAGEMENT
  // ==========================================

  goToAppointments(): void {

    this.router.navigate([
      '/admin/appointments'
    ]);

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}