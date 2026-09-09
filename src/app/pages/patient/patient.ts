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

    // Not implemented yet

  }


  goToCreateAppointment(): void {

    // Not implemented yet

  }


  goToAppointments(): void {

    // Not implemented yet

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