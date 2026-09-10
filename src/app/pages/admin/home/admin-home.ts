import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Patient,
  PatientService
} from '../../../services/patient.service';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

import {
  AppointmentService
} from '../../../services/appointment.service';

import {
  UserService
} from '../../../services/user.service';


/* =========================================================
   DASHBOARD APPOINTMENT MODEL
   ========================================================= */

interface DashboardAppointment {

  id?: number;

  patientId?: number;

  patientName: string;

  doctorId?: number;

  doctorName: string;

  appointmentDate: string;

  appointmentTime: string;

  reason: string;

  status: string;

}


/* =========================================================
   DASHBOARD COMPONENT
   ========================================================= */

@Component({
  selector: 'app-admin-home',

  imports: [],

  templateUrl: './admin-home.html',

  styleUrl: './admin-home.css'
})
export class AdminHome implements OnInit {


  /* =======================================================
     SERVICES
     ======================================================= */

  private router =
    inject(Router);

  private patientService =
    inject(PatientService);

  private doctorService =
    inject(DoctorService);

  private appointmentService =
    inject(AppointmentService);

  private userService =
    inject(UserService);


  /* =======================================================
     LOADING
     ======================================================= */

  loading = true;


  /* =======================================================
     DASHBOARD COUNTS
     ======================================================= */

  totalPatients = 0;

  totalDoctors = 0;

  totalAppointments = 0;

  totalUsers = 0;


  /* =======================================================
     APPOINTMENT STATUS COUNTS
     ======================================================= */

  scheduledAppointments = 0;

  confirmedAppointments = 0;

  completedAppointments = 0;

  cancelledAppointments = 0;


  /* =======================================================
     RECENT APPOINTMENTS
     ======================================================= */

  appointments:
    DashboardAppointment[] = [];


  /* =======================================================
     CURRENT DATE
     ======================================================= */

  currentDate = new Date();


  /* =======================================================
     INITIALIZE
     ======================================================= */

  ngOnInit(): void {

    this.loadDashboard();

  }


  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  loadDashboard(): void {

    this.loading = true;


    this.loadPatients();

    this.loadDoctors();

    this.loadAppointments();

    this.loadUsers();

  }


  /* =======================================================
     LOAD PATIENTS
     ======================================================= */

  private loadPatients(): void {

    this.patientService
      .getPatients()
      .subscribe({

        next: (
          data: Patient[]
        ) => {

          this.totalPatients =
            data.length;

          this.checkLoading();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Dashboard patient error:',
            error
          );

          this.totalPatients = 0;

          this.checkLoading();

        }

      });

  }


  /* =======================================================
     LOAD DOCTORS
     ======================================================= */

  private loadDoctors(): void {

    this.doctorService
      .getDoctors()
      .subscribe({

        next: (
          data: Doctor[]
        ) => {

          this.totalDoctors =
            data.length;

          this.checkLoading();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Dashboard doctor error:',
            error
          );

          this.totalDoctors = 0;

          this.checkLoading();

        }

      });

  }


  /* =======================================================
     LOAD USERS
     ======================================================= */

  private loadUsers(): void {

    this.userService
      .getUsers()
      .subscribe({

        next: (
          data: any[]
        ) => {

          this.totalUsers =
            data.length;

          this.checkLoading();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Dashboard user error:',
            error
          );

          this.totalUsers = 0;

          this.checkLoading();

        }

      });

  }


  /* =======================================================
     LOAD APPOINTMENTS
     ======================================================= */

  private loadAppointments(): void {

    this.appointmentService
      .getAppointments()
      .subscribe({

        next: (
          data: any[]
        ) => {

          this.totalAppointments =
            data.length;


          this.appointments =
            data.map(
              appointment =>
                this.mapAppointment(
                  appointment
                )
            );


          this.calculateAppointmentStatuses();

          this.checkLoading();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Dashboard appointment error:',
            error
          );

          this.totalAppointments = 0;

          this.appointments = [];

          this.checkLoading();

        }

      });

  }


  /* =======================================================
     MAP APPOINTMENT
     ======================================================= */

  private mapAppointment(
    appointment: any
  ): DashboardAppointment {

    const patient =
      appointment.patient;

    const doctor =
      appointment.doctor;


    return {

      id:
        appointment.id,

      patientId:
        Number(
          appointment.patientId ??
          patient?.id ??
          0
        ),

      patientName:
        appointment.patientName ??
        patient?.name ??
        'Unknown Patient',

      doctorId:
        Number(
          appointment.doctorId ??
          doctor?.id ??
          0
        ),

      doctorName:
        appointment.doctorName ??
        doctor?.name ??
        'Unknown Doctor',

      appointmentDate:
        appointment.appointmentDate ??
        '',

      appointmentTime:
        this.formatTime(
          appointment.appointmentTime
        ),

      reason:
        appointment.reason ??
        '',

      status:
        appointment.status ??
        'SCHEDULED'

    };

  }


  /* =======================================================
     FORMAT TIME
     ======================================================= */

  private formatTime(
    time: any
  ): string {

    if (!time) {

      return '';

    }


    const value =
      String(time);


    if (value.length >= 5) {

      return value.substring(
        0,
        5
      );

    }


    return value;

  }


  /* =======================================================
     CALCULATE STATUS
     ======================================================= */

  private calculateAppointmentStatuses(): void {

    this.scheduledAppointments = 0;

    this.confirmedAppointments = 0;

    this.completedAppointments = 0;

    this.cancelledAppointments = 0;


    for (
      const appointment of this.appointments
    ) {

      switch (
        appointment.status
          .toUpperCase()
      ) {

        case 'SCHEDULED':

          this.scheduledAppointments++;

          break;


        case 'CONFIRMED':

          this.confirmedAppointments++;

          break;


        case 'COMPLETED':

          this.completedAppointments++;

          break;


        case 'CANCELLED':

          this.cancelledAppointments++;

          break;

      }

    }

  }


  /* =======================================================
     LOADING CHECK
     ======================================================= */

  private completedRequests = 0;


  private checkLoading(): void {

    this.completedRequests++;


    if (
      this.completedRequests >= 4
    ) {

      this.loading = false;

      this.completedRequests = 0;

    }

  }


  /* =======================================================
     REFRESH
     ======================================================= */

  refreshDashboard(): void {

    this.completedRequests = 0;

    this.loadDashboard();

  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  goToPatients(): void {

    this.router.navigate(
      ['/admin/patients']
    );

  }


  goToDoctors(): void {

    this.router.navigate(
      ['/admin/doctors']
    );

  }


  goToUsers(): void {

    this.router.navigate(
      ['/admin/users']
    );

  }


  goToAppointments(): void {

    this.router.navigate(
      ['/admin/appointments']
    );

  }


  /* =======================================================
     RECENT APPOINTMENTS
     ======================================================= */

  get recentAppointments():
    DashboardAppointment[] {

    return [
      ...this.appointments
    ]

      .sort(
        (a, b) => {

          const dateA =
            `${a.appointmentDate} ${a.appointmentTime}`;

          const dateB =
            `${b.appointmentDate} ${b.appointmentTime}`;

          return dateB.localeCompare(
            dateA
          );

        }
      )

      .slice(
        0,
        5
      );

  }


  /* =======================================================
     STATUS PERCENTAGE
     ======================================================= */

  getStatusPercentage(
    count: number
  ): number {

    if (
      this.totalAppointments === 0
    ) {

      return 0;

    }


    return Math.round(
      (
        count /
        this.totalAppointments
      ) *
      100
    );

  }


  /* =======================================================
     DATE
     ======================================================= */

  get formattedDate(): string {

    return this.currentDate.toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );

  }


  /* =======================================================
     GREETING
     ======================================================= */

  get greeting(): string {

    const hour =
      this.currentDate.getHours();


    if (hour < 12) {

      return 'Good morning';

    }


    if (hour < 17) {

      return 'Good afternoon';

    }


    return 'Good evening';

  }

}