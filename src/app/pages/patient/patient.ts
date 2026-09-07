import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient',
  imports: [],
  templateUrl: './patient.html',
  styleUrl: './patient.css'
})
export class Patient {

  private router = inject(Router);

  goToDoctors(): void {

    this.router.navigate([
      '/patient/doctors'
    ]);
  }

  goToCreateAppointment(): void {

    this.router.navigate([
      '/patient/create-appointment'
    ]);
  }

  goToAppointments(): void {

    this.router.navigate([
      '/patient/appointments'
    ]);
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate([
      '/login'
    ]);
  }
}