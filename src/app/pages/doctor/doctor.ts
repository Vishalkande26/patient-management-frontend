import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor',
  imports: [],
  templateUrl: './doctor.html',
  styleUrl: './doctor.css'
})
export class Doctor {

  private router = inject(Router);

  goToPatients(): void {
    this.router.navigate(['/doctor/patients']);
  }

  goToAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}