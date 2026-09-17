import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  RouterLink
} from '@angular/router';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

@Component({
  selector: 'app-patient-doctors',
  imports: [RouterLink],
  templateUrl: './patient-doctors.html',
  styleUrl: './patient-doctors.css'
})
export class PatientDoctors implements OnInit {

  private doctorService = inject(DoctorService);

  doctors: Doctor[] = [];

  errorMessage = '';

  // Used to distinguish:
  // not loaded yet vs loaded with zero doctors
  hasLoaded = false;

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {

    // Show cached doctors immediately if available
    this.doctors = this.doctorService.getCachedDoctors();

    this.doctorService.getDoctors().subscribe({

      next: (data: Doctor[]) => {

        console.log('Doctors received:', data);

        this.doctors = data;

        // Update cache with latest doctors
        this.doctorService.setCachedDoctors(data);

        this.hasLoaded = true;

        this.errorMessage = '';
      },

      error: (error: HttpErrorResponse) => {

        console.error('Error loading doctors:', error);

        // If cache already contains doctors,
        // continue showing them.
        if (this.doctors.length > 0) {
          this.hasLoaded = true;
          return;
        }

        this.hasLoaded = true;

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error.status === 403) {

          this.errorMessage =
            'You are not allowed to view doctors.';

        } else {

          this.errorMessage =
            'Unable to load doctors.';
        }
      }
    });
  }
}