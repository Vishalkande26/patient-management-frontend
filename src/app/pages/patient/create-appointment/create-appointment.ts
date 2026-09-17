import {
  Component,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  AppointmentRequest,
  AppointmentService
} from '../../../services/appointment.service';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

import {
  AuthService
} from '../../../services/auth.service';


@Component({
  selector: 'app-create-appointment',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './create-appointment.html',

  styleUrl: './create-appointment.css'
})
export class CreateAppointment {


  // ==========================================
  // SERVICES
  // ==========================================

  private appointmentService =
    inject(AppointmentService);

  private doctorService =
    inject(DoctorService);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  // ==========================================
  // DATA
  // ==========================================

  doctors: Doctor[] = [];

  patientId: number | null = null;


  // ==========================================
  // FORM
  // ==========================================

  appointment: AppointmentRequest = {

    patientId: 0,

    doctorId: 0,

    appointmentDate: '',

    appointmentTime: '',

    reason: '',

    status: 'PENDING'
  };


  // ==========================================
  // UI
  // ==========================================

  today = '';

  hasLoaded = false;

  submitting = false;

  successMessage = '';

  errorMessage = '';


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    this.today =
      new Date()
        .toISOString()
        .split('T')[0];


    this.patientId =
      this.authService.getPatientId();


    console.log(
      'Patient ID:',
      this.patientId
    );


    if (this.patientId === null) {

      this.errorMessage =
        'Patient information not found. Please login again.';

      return;
    }


    this.appointment.patientId =
      this.patientId;


    this.loadDoctors();
  }


  // ==========================================
  // LOAD DOCTORS
  // ==========================================

  loadDoctors(): void {

    this.hasLoaded = false;

    this.errorMessage = '';


    this.doctorService
      .getDoctors()
      .subscribe({

        next: (
          data: Doctor[]
        ) => {

          console.log(
            'Doctors loaded:',
            data
          );

          this.doctors = data;

          this.hasLoaded = true;
        },


        error: (
          error: any
        ) => {

          console.error(
            'Error loading doctors:',
            error
          );

          this.hasLoaded = true;

          this.errorMessage =
            'Unable to load doctors. Please try again.';
        }

      });
  }


  // ==========================================
  // SUBMIT APPOINTMENT
  // ==========================================

  submitAppointment(): void {

    this.successMessage = '';

    this.errorMessage = '';


    // ------------------------------------------
    // Validate patient
    // ------------------------------------------

    if (this.patientId === null) {

      this.errorMessage =
        'Patient information not found. Please login again.';

      return;
    }


    // ------------------------------------------
    // Validate doctor
    // ------------------------------------------

    if (
      !this.appointment.doctorId ||
      this.appointment.doctorId <= 0
    ) {

      this.errorMessage =
        'Please select a doctor.';

      return;
    }


    // ------------------------------------------
    // Validate date
    // ------------------------------------------

    if (!this.appointment.appointmentDate) {

      this.errorMessage =
        'Please select appointment date.';

      return;
    }


    // ------------------------------------------
    // Validate time
    // ------------------------------------------

    if (!this.appointment.appointmentTime) {

      this.errorMessage =
        'Please select appointment time.';

      return;
    }


    // ------------------------------------------
    // Validate reason
    // ------------------------------------------

    if (
      !this.appointment.reason ||
      !this.appointment.reason.trim()
    ) {

      this.errorMessage =
        'Please enter appointment reason.';

      return;
    }


    // ------------------------------------------
    // Set patient ID
    // ------------------------------------------

    this.appointment.patientId =
      this.patientId;


    // ------------------------------------------
    // Set status
    // ------------------------------------------

    this.appointment.status =
      'PENDING';


    console.log(
      'Creating appointment:',
      this.appointment
    );


    this.submitting = true;


    // ==========================================
    // API CALL
    // ==========================================

    this.appointmentService
      .createAppointment(
        this.appointment
      )
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: (
          response
        ) => {

          console.log(
            'Appointment created:',
            response
          );


          this.submitting = false;


          this.successMessage =
            'Appointment created successfully.';


          /*
           * Go directly to appointment list.
           */

          this.router.navigate(
            ['/patient/appointments']
          );
        },


        // ======================================
        // ERROR
        // ======================================

        error: (
          error: any
        ) => {

          console.error(
            'Appointment creation error:',
            error
          );


          this.submitting = false;


          if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Invalid appointment data.';

          } else if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You are not allowed to create appointments.';

          } else if (error.status === 409) {

            this.errorMessage =
              error.error?.message ||
              'This doctor already has an appointment at this time.';

          } else {

            this.errorMessage =
              'Unable to create appointment. Please try again.';
          }
        }

      });
  }


  // ==========================================
  // BACK
  // ==========================================

  goBack(): void {

    this.router.navigate(
      ['/patient']
    );
  }

}