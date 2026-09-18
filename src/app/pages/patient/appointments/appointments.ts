import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Appointment,
  AppointmentService
} from '../../../services/appointment.service';

import {
  AuthService
} from '../../../services/auth.service';

@Component({
  selector: 'app-appointments',

  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],

  templateUrl: './appointments.html',

  styleUrl: './appointments.css'
})
export class Appointments {

  private appointmentService =
    inject(AppointmentService);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  // ==========================================
  // DATA
  // ==========================================

  appointments: Appointment[] = [];

  filteredAppointments: Appointment[] = [];


  // ==========================================
  // PATIENT
  // ==========================================

  patientId: number | null = null;


  // ==========================================
  // UI
  // ==========================================

  isLoading = false;

  isRefreshing = false;

  message = '';

  searchText = '';


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    console.log(
      'Appointments page loaded'
    );

    this.patientId =
      this.authService.getPatientId();

    console.log(
      'Logged-in patient ID:',
      this.patientId
    );

    if (this.patientId === null) {

      this.message =
        'Patient information not found. Please login again.';

      return;
    }

    const recentlyCreated =
      this.appointmentService
        .consumeRecentlyCreatedAppointment();

    if (
      recentlyCreated &&
      Number(recentlyCreated.patientId) === Number(this.patientId)
    ) {

      this.appointments = [recentlyCreated];

      this.filteredAppointments = [recentlyCreated];

      this.message = 'Appointment created successfully.';
    }

    this.loadAppointments();
  }


  // ==========================================
  // LOAD APPOINTMENTS
  // ==========================================

  loadAppointments(): void {

    const hasAppointmentsToDisplay =
      this.appointments.length > 0;

    this.isLoading = !hasAppointmentsToDisplay;

    this.isRefreshing = hasAppointmentsToDisplay;

    this.message = '';

    console.log(
      'Calling GET /api/appointments'
    );


    this.appointmentService
      .getAppointments()
      .subscribe({

        next: (
          response: any
        ) => {

          console.log(
            'Raw appointments response:',
            response
          );


          /*
           * Make sure we always work
           * with an array.
           */
          let data: Appointment[] = [];


          if (Array.isArray(response)) {

            data = response;

          } else if (
            response &&
            Array.isArray(response.content)
          ) {

            /*
             * Handles paginated response:
             *
             * {
             *   content: [...]
             * }
             */
            data = response.content;

          } else if (
            response &&
            Array.isArray(response.data)
          ) {

            /*
             * Handles wrapped response:
             *
             * {
             *   data: [...]
             * }
             */
            data = response.data;

          } else {

            console.error(
              'Unexpected appointments response:',
              response
            );

            data = [];
          }


          console.log(
            'Appointments array:',
            data
          );


          /*
           * Filter appointments belonging
           * to the logged-in patient.
           *
           * Number() prevents problems such as:
           *
           * patientId = "6"
           *
           * versus
           *
           * patientId = 6
           */
          this.appointments =
            data.filter(
              appointment => {

                return Number(
                  appointment.patientId
                ) === Number(
                  this.patientId
                );

              }
            );


          console.log(
            'Patient appointments:',
            this.appointments
          );


          /*
           * Display the filtered list
           * immediately.
           */
          this.filteredAppointments =
            [
              ...this.appointments
            ];


          /*
           * IMPORTANT:
           * Stop loading after processing
           * the response.
           */
          this.isLoading = false;

          this.isRefreshing = false;


          /*
           * Show message only when
           * there are no appointments.
           */
          if (
            this.appointments.length === 0
          ) {

            this.message =
              'No appointments found.';
          }

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error loading appointments:',
            error
          );


          /*
           * Always stop loading
           * when API fails.
           */
          this.isLoading = false;

          this.isRefreshing = false;


          if (error.status === 401) {

            this.message =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.message =
              'You are not allowed to view appointments.';

          } else if (error.status === 404) {

            this.message =
              'Appointment API not found.';

          } else {

            this.message =
              'Unable to load appointments. Please try again.';
          }

        }

      });
  }


  // ==========================================
  // SEARCH
  // ==========================================

  searchAppointments(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredAppointments =
        [
          ...this.appointments
        ];

      return;
    }


    this.filteredAppointments =
      this.appointments.filter(
        appointment => {

          const doctorName =
            (
              appointment.doctorName || ''
            ).toLowerCase();


          const specialization =
            (
              appointment.doctorSpecialization || ''
            ).toLowerCase();


          const reason =
            (
              appointment.reason || ''
            ).toLowerCase();


          const status =
            (
              appointment.status || ''
            ).toLowerCase();


          const date =
            (
              appointment.appointmentDate || ''
            ).toLowerCase();


          return (
            doctorName.includes(search) ||
            specialization.includes(search) ||
            reason.includes(search) ||
            status.includes(search) ||
            date.includes(search)
          );

        }
      );
  }


  // ==========================================
  // REFRESH
  // ==========================================

  refreshAppointments(): void {

    this.loadAppointments();
  }


  // ==========================================
  // CREATE APPOINTMENT
  // ==========================================

  createNewAppointment(): void {

    this.router.navigate(
      ['/patient/create-appointment']
    );
  }


  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  goBack(): void {

    this.router.navigate(
      ['/patient']
    );
  }

}