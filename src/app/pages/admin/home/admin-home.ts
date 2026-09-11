import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  imports: [RouterLink],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css'
})
export class AdminHome {

  currentDate: string = '';

  constructor() {
    this.currentDate = new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    );
  }

  refreshDashboard(): void {
    window.location.reload();
  }

}