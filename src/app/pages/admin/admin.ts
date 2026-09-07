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
    this.router.navigate(['/admin/users']);
  }

  goToDoctors(): void {
    this.router.navigate(['/admin/doctors']);
  }

  goToPatients(): void {
    this.router.navigate(['/admin/patients']);
  }

  goToAppointments(): void {
    this.router.navigate(['/admin/appointments']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);
  }
}