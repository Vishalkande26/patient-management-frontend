import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';


@Component({
  selector: 'app-patient-doctors',
  imports: [],
  templateUrl: './patient-doctors.html',
  styleUrl: './patient-doctors.css'
})
export class PatientDoctors implements OnInit {

  private doctorService =
    inject(DoctorService);

  private router =
    inject(Router);


  doctors: Doctor[] = [];

  loading = false;

  errorMessage = '';


  ngOnInit(): void {

    this.loadDoctors();

  }


  loadDoctors(): void {

    this.loading = true;

    this.errorMessage = '';


    this.doctorService
      .getDoctors()
      .subscribe({

        next: (data: Doctor[]) => {

          console.log(
            'Patient doctors:',
            data
          );

          this.doctors = data;

          this.loading = false;

        },


        error: (error: HttpErrorResponse) => {

          console.error(
            'Error loading doctors:',
            error
          );

          this.loading = false;


          if (error.status === 401) {

            this.errorMessage =
              'Please login again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'Patient is not allowed to view doctors.';

          }

          else {

            this.errorMessage =
              'Failed to load doctors.';

          }

        }

      });

  }


  backToDashboard(): void {

    this.router.navigate([
      '/patient'
    ]);

  }

}