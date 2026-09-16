import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  private router = inject(Router);

  role = localStorage.getItem('role') || 'PATIENT';


  viewDoctors(): void {

    this.router.navigate([
      '/patient/doctors'
    ]);

  }


  createAppointment(): void {

    this.router.navigate([
      '/patient/create-appointment'
    ]);

  }


  viewAppointments(): void {

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