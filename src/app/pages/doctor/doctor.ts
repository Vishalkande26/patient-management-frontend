import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-doctor',

  imports: [],

  templateUrl: './doctor.html',

  styleUrl: './doctor.css'
})
export class Doctor {

  private router = inject(Router);

  private authService = inject(AuthService);


  // ==========================================
  // DOCTOR DASHBOARD
  // ==========================================

  goToDashboard(): void {

    this.router.navigate([
      '/doctor'
    ]);

  }


  // ==========================================
  // PATIENTS
  // ==========================================

  goToPatients(): void {

    this.router.navigate([
      '/doctor/patients'
    ]);

  }


  // ==========================================
  // APPOINTMENTS
  // ==========================================

  goToAppointments(): void {

    this.router.navigate([
      '/doctor/appointments'
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