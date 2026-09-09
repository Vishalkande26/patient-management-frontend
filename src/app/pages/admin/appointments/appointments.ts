import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import {
  Appointment,
  AppointmentRequest,
  AppointmentService
} from '../../../services/appointment.service';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

import {
  Patient,
  PatientService
} from '../../../services/patient.service';

@Component({
  selector: 'app-appointments',

  imports: [
    FormsModule
  ],

  templateUrl: './appointments.html',

  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {

  private appointmentService =
    inject(AppointmentService);

  private doctorService =
    inject(DoctorService);

  private patientService =
    inject(PatientService);


  appointments: Appointment[] = [];

  doctors: Doctor[] = [];

  patients: Patient[] = [];

  loading = false;


  patientId: number | null = null;

  doctorId: number | null = null;

  appointmentDate = '';

  appointmentTime = '';

  reason = '';

  status = 'PENDING';


  editingId: number | null = null;


  searchTerm = '';

  statusFilter = 'ALL';


  sortField:
    | 'id'
    | 'date'
    | 'patient'
    | 'doctor'
    | 'status' = 'id';

  sortDirection: 'asc' | 'desc' = 'asc';


  showPopup = false;

  popupMessage = '';

  popupType: 'success' | 'error' = 'success';


  statuses = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
  ];


  ngOnInit(): void {

    this.loadAppointments();

    this.loadDoctors();

    this.loadPatients();
  }


  loadAppointments(): void {

    this.loading = true;

    this.appointmentService
      .getAppointments()
      .subscribe({

        next: data => {

          this.appointments = data;

          this.loading = false;
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.loading = false;

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to load appointments.'
            )
          );
        }
      });
  }


  loadDoctors(): void {

    this.doctorService
      .getDoctors()
      .subscribe({

        next: data => {

          this.doctors = data;
        },

        error: error => {

          console.error(
            'Failed to load doctors',
            error
          );
        }
      });
  }


  loadPatients(): void {

    this.patientService
      .getPatients()
      .subscribe({

        next: data => {

          this.patients = data;
        },

        error: error => {

          console.error(
            'Failed to load patients',
            error
          );
        }
      });
  }


  get filteredAppointments(): Appointment[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    let result =
      this.appointments.filter(
        appointment => {

          const matchesSearch =
            !search ||
            appointment.patientName
              .toLowerCase()
              .includes(search) ||
            appointment.doctorName
              .toLowerCase()
              .includes(search) ||
            appointment.reason
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            this.statusFilter === 'ALL' ||
            appointment.status ===
              this.statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );


    result = [...result].sort(
      (a, b) => {

        let first = '';
        let second = '';

        if (this.sortField === 'id') {

          return this.sortDirection === 'asc'
            ? (a.id ?? 0) - (b.id ?? 0)
            : (b.id ?? 0) - (a.id ?? 0);
        }

        if (this.sortField === 'date') {

          first =
            `${a.appointmentDate} ${a.appointmentTime}`;

          second =
            `${b.appointmentDate} ${b.appointmentTime}`;
        }

        if (this.sortField === 'patient') {

          first =
            a.patientName.toLowerCase();

          second =
            b.patientName.toLowerCase();
        }

        if (this.sortField === 'doctor') {

          first =
            a.doctorName.toLowerCase();

          second =
            b.doctorName.toLowerCase();
        }

        if (this.sortField === 'status') {

          first = a.status;

          second = b.status;
        }

        const comparison =
          first < second
            ? -1
            : first > second
              ? 1
              : 0;

        return this.sortDirection === 'asc'
          ? comparison
          : -comparison;
      }
    );

    return result;
  }


  sortBy(
    field:
      | 'id'
      | 'date'
      | 'patient'
      | 'doctor'
      | 'status'
  ): void {

    if (this.sortField === field) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      return;
    }

    this.sortField = field;

    this.sortDirection = 'asc';
  }


  saveAppointment(): void {

    if (
      this.patientId === null ||
      this.doctorId === null ||
      !this.appointmentDate ||
      !this.appointmentTime ||
      !this.reason.trim()
    ) {

      this.showError(
        'Please fill all appointment fields.'
      );

      return;
    }


    const request: AppointmentRequest = {

      patientId:
        this.patientId,

      doctorId:
        this.doctorId,

      appointmentDate:
        this.appointmentDate,

      appointmentTime:
        this.appointmentTime,

      reason:
        this.reason.trim(),

      status:
        this.status
    };


    if (this.editingId === null) {

      this.appointmentService
        .createAppointment(request)
        .subscribe({

          next: response => {

            this.appointments = [
              ...this.appointments,
              response
            ];

            this.clearForm();

            this.loadAppointments();

            this.showSuccess(
              'Appointment created successfully.'
            );
          },

          error: (error: HttpErrorResponse) => {

            console.error(error);

            this.showError(
              this.getErrorMessage(
                error,
                'Failed to create appointment.'
              )
            );
          }
        });

      return;
    }


    this.appointmentService
      .updateAppointment(
        this.editingId,
        request
      )
      .subscribe({

        next: response => {

          this.appointments =
            this.appointments.map(
              item =>
                item.id === response.id
                  ? response
                  : item
            );

          this.clearForm();

          this.loadAppointments();

          this.showSuccess(
            'Appointment updated successfully.'
          );
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to update appointment.'
            )
          );
        }
      });
  }


  editAppointment(
    appointment: Appointment
  ): void {

    this.editingId =
      appointment.id ?? null;

    this.patientId =
      appointment.patientId;

    this.doctorId =
      appointment.doctorId;

    this.appointmentDate =
      appointment.appointmentDate;

    this.appointmentTime =
      appointment.appointmentTime.substring(
        0,
        5
      );

    this.reason =
      appointment.reason;

    this.status =
      appointment.status;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  deleteAppointment(
    id: number | undefined
  ): void {

    if (id === undefined) {
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this appointment?'
      )
    ) {
      return;
    }


    this.appointmentService
      .deleteAppointment(id)
      .subscribe({

        next: () => {

          this.appointments =
            this.appointments.filter(
              appointment =>
                appointment.id !== id
            );

          this.showSuccess(
            'Appointment deleted successfully.'
          );
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to delete appointment.'
            )
          );
        }
      });
  }


  clearForm(): void {

    this.patientId = null;

    this.doctorId = null;

    this.appointmentDate = '';

    this.appointmentTime = '';

    this.reason = '';

    this.status = 'PENDING';

    this.editingId = null;
  }


  showSuccess(message: string): void {

    this.popupMessage = message;

    this.popupType = 'success';

    this.showPopup = true;

    setTimeout(() => {

      this.showPopup = false;

    }, 2500);
  }


  showError(message: string): void {

    this.popupMessage = message;

    this.popupType = 'error';

    this.showPopup = true;

    setTimeout(() => {

      this.showPopup = false;

    }, 3000);
  }


  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    return error.error?.message
      || error.error?.detail
      || fallback;
  }
}