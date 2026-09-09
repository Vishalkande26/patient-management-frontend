import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',

  imports: [],

  templateUrl: './admin.html',

  styleUrl: './admin.css'
})
export class Admin {

  private router = inject(Router);

  goToUsers(): void {

    // Users page is not implemented yet.
    // Do nothing.
  }

  goToDoctors(): void {

    this.router.navigate(['/admin/doctors']);
  }

  goToPatients(): void {

    this.router.navigate(['/admin/patients']);
  }

  goToAppointments(): void {

    // Appointments page is not implemented yet.
    // Do nothing.
  }

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('username');

    localStorage.removeItem('email');

    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}