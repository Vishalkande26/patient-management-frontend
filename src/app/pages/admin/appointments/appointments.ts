import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AppointmentService
} from '../../../services/appointment.service';

import {
  Patient,
  PatientService
} from '../../../services/patient.service';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

import {
  Modal
} from '../../../shared/modal/modal';


/* =========================================================
   APPOINTMENT DISPLAY MODEL
   ========================================================= */

interface AppointmentRow {

  id?: number;

  patientId: number;

  patientName: string;

  patientDisease: string;

  patientAddress: string;

  doctorId: number;

  doctorName: string;

  doctorSpecialization: string;

  appointmentDate: string;

  appointmentTime: string;

  reason: string;

  status: string;

}


/* =========================================================
   APPOINTMENT REQUEST MODEL
   ========================================================= */

interface AppointmentRequest {

  patientId: number;

  doctorId: number;

  appointmentDate: string;

  appointmentTime: string;

  reason: string;

  status: string;

}


/* =========================================================
   COMPONENT
   ========================================================= */

@Component({
  selector: 'app-appointments',

  imports: [
    FormsModule,
    Modal
  ],

  templateUrl: './appointments.html',

  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {


  /* =======================================================
     SERVICES
     ======================================================= */

  private appointmentService =
    inject(AppointmentService);

  private patientService =
    inject(PatientService);

  private doctorService =
    inject(DoctorService);

  private router =
    inject(Router);


  /* =======================================================
     DATA
     ======================================================= */

  appointments: AppointmentRow[] = [];

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  filteredAppointments: AppointmentRow[] = [];


  /* =======================================================
     LOADING
     ======================================================= */

  loading = false;

  saving = false;

  deleting = false;


  /* =======================================================
     FORM FIELDS
     ======================================================= */

  patientId: number | null = null;

  doctorId: number | null = null;

  appointmentDate = '';

  appointmentTime = '';

  reason = '';

  status = 'SCHEDULED';


  /* =======================================================
     EDIT MODE
     ======================================================= */

  editingId: number | null = null;


  /* =======================================================
     MODALS
     ======================================================= */

  showAppointmentModal = false;

  showDeleteModal = false;

  selectedAppointment: AppointmentRow | null = null;


  /* =======================================================
     TOAST
     ======================================================= */

  showPopup = false;

  popupMessage = '';

  popupType: 'success' | 'error' = 'success';


  /* =======================================================
     FILTERS
     ======================================================= */

  searchTerm = '';

  patientFilter = 'ALL';

  doctorFilter = 'ALL';

  statusFilter = 'ALL';

  patientColumnFilter = '';

  doctorColumnFilter = '';

  dateColumnFilter = '';

  timeColumnFilter = '';

  reasonColumnFilter = '';

  statusColumnFilter = '';


  /* =======================================================
     SORTING
     ======================================================= */

  sortColumn = 'appointmentDate';

  sortDirection: 'asc' | 'desc' = 'desc';


  /* =======================================================
     PAGINATION
     ======================================================= */

  currentPage = 1;

  pageSize = 5;

  pageSizeOptions = [
    5,
    10,
    20
  ];


  /* =======================================================
     STATUS OPTIONS
     ======================================================= */

  statuses = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
  ];


  /* =======================================================
     INITIALIZE
     ======================================================= */

  ngOnInit(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadAppointments();

  }


  /* =======================================================
     LOAD APPOINTMENTS
     ======================================================= */

  loadAppointments(): void {

    this.loading = true;

    this.appointmentService
      .getAppointments()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'Appointments loaded:',
            data
          );

          this.appointments =
            data.map(
              appointment =>
                this.mapAppointment(
                  appointment
                )
            );

          this.loading = false;

          this.applyFilters();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading appointments:',
            error
          );

          this.loading = false;

          if (
            error.status === 401
          ) {

            this.showError(
              'Please login again.'
            );

          } else if (
            error.status === 403
          ) {

            this.showError(
              'You do not have permission to view appointments.'
            );

          } else {

            this.showError(
              'Failed to load appointments.'
            );

          }

        }

      });

  }


  /* =======================================================
     MAP BACKEND APPOINTMENT
     ======================================================= */

  private mapAppointment(
    appointment: any
  ): AppointmentRow {

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

      patientDisease:
        appointment.patientDisease ??
        patient?.disease ??
        '',

      patientAddress:
        appointment.patientAddress ??
        patient?.address ??
        '',

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

      doctorSpecialization:
        appointment.doctorSpecialization ??
        doctor?.specialization ??
        '',

      appointmentDate:
        appointment.appointmentDate ??
        '',

      appointmentTime:
        this.formatTimeForInput(
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
     LOAD PATIENTS
     ======================================================= */

  loadPatients(): void {

    this.patientService
      .getPatients()
      .subscribe({

        next: (
          data: Patient[]
        ) => {

          this.patients = data;

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading patients:',
            error
          );

        }

      });

  }


  /* =======================================================
     LOAD DOCTORS
     ======================================================= */

  loadDoctors(): void {

    this.doctorService
      .getDoctors()
      .subscribe({

        next: (
          data: Doctor[]
        ) => {

          this.doctors = data;

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading doctors:',
            error
          );

        }

      });

  }


  /* =======================================================
     REFRESH
     ======================================================= */

  refreshAppointments(): void {

    this.loadPatients();

    this.loadDoctors();

    this.loadAppointments();

  }


  /* =======================================================
     BACK TO DASHBOARD
     ======================================================= */

  backToDashboard(): void {

    this.router.navigate(
      ['/admin']
    );

  }


  /* =======================================================
     SEARCH
     ======================================================= */

  onSearchChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  /* =======================================================
     FILTER CHANGE
     ======================================================= */

  onFilterChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  clearSearch(): void {

    this.searchTerm = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  /* =======================================================
     CLEAR ALL FILTERS
     ======================================================= */

  clearAllFilters(): void {

    this.searchTerm = '';

    this.patientFilter = 'ALL';

    this.doctorFilter = 'ALL';

    this.statusFilter = 'ALL';

    this.clearColumnFilters();

  }


  /* =======================================================
     CLEAR COLUMN FILTERS
     ======================================================= */

  clearColumnFilters(): void {

    this.patientColumnFilter = '';

    this.doctorColumnFilter = '';

    this.dateColumnFilter = '';

    this.timeColumnFilter = '';

    this.reasonColumnFilter = '';

    this.statusColumnFilter = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  /* =======================================================
     APPLY FILTERS
     ======================================================= */

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    const patientColumn =
      this.patientColumnFilter
        .trim()
        .toLowerCase();

    const doctorColumn =
      this.doctorColumnFilter
        .trim()
        .toLowerCase();

    const dateColumn =
      this.dateColumnFilter
        .trim()
        .toLowerCase();

    const timeColumn =
      this.timeColumnFilter
        .trim()
        .toLowerCase();

    const reasonColumn =
      this.reasonColumnFilter
        .trim()
        .toLowerCase();

    const statusColumn =
      this.statusColumnFilter
        .trim()
        .toLowerCase();


    this.filteredAppointments =
      this.appointments.filter(
        appointment => {

          const searchableText =
            [

              appointment.id,

              appointment.patientId,

              appointment.patientName,

              appointment.patientDisease,

              appointment.patientAddress,

              appointment.doctorId,

              appointment.doctorName,

              appointment.doctorSpecialization,

              appointment.appointmentDate,

              appointment.appointmentTime,

              appointment.reason,

              appointment.status

            ]
              .join(' ')
              .toLowerCase();


          const matchesSearch =
            !search ||
            searchableText.includes(
              search
            );


          const matchesPatient =
            this.patientFilter === 'ALL' ||
            String(
              appointment.patientId
            ) ===
              String(
                this.patientFilter
              );


          const matchesDoctor =
            this.doctorFilter === 'ALL' ||
            String(
              appointment.doctorId
            ) ===
              String(
                this.doctorFilter
              );


          const matchesStatus =
            this.statusFilter === 'ALL' ||
            appointment.status ===
              this.statusFilter;


          const matchesPatientColumn =
            !patientColumn ||
            [

              appointment.patientId,

              appointment.patientName,

              appointment.patientDisease,

              appointment.patientAddress

            ]
              .join(' ')
              .toLowerCase()
              .includes(
                patientColumn
              );


          const matchesDoctorColumn =
            !doctorColumn ||
            [

              appointment.doctorId,

              appointment.doctorName,

              appointment.doctorSpecialization

            ]
              .join(' ')
              .toLowerCase()
              .includes(
                doctorColumn
              );


          const matchesDateColumn =
            !dateColumn ||
            appointment.appointmentDate
              .toLowerCase()
              .includes(
                dateColumn
              );


          const matchesTimeColumn =
            !timeColumn ||
            appointment.appointmentTime
              .toLowerCase()
              .includes(
                timeColumn
              );


          const matchesReasonColumn =
            !reasonColumn ||
            appointment.reason
              .toLowerCase()
              .includes(
                reasonColumn
              );


          const matchesStatusColumn =
            !statusColumn ||
            appointment.status
              .toLowerCase()
              .includes(
                statusColumn
              );


          return (

            matchesSearch &&

            matchesPatient &&

            matchesDoctor &&

            matchesStatus &&

            matchesPatientColumn &&

            matchesDoctorColumn &&

            matchesDateColumn &&

            matchesTimeColumn &&

            matchesReasonColumn &&

            matchesStatusColumn

          );

        }
      );


    this.applySorting();

    this.fixCurrentPage();

  }


  /* =======================================================
     SORTING
     ======================================================= */

  sortBy(
    column: string
  ): void {

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }

    this.applySorting();

  }


  /* =======================================================
     APPLY SORTING
     ======================================================= */

  applySorting(): void {

    this.filteredAppointments.sort(
      (a, b) => {

        const first =
          this.getSortValue(
            a,
            this.sortColumn
          );

        const second =
          this.getSortValue(
            b,
            this.sortColumn
          );


        if (
          first < second
        ) {

          return this.sortDirection === 'asc'
            ? -1
            : 1;

        }


        if (
          first > second
        ) {

          return this.sortDirection === 'asc'
            ? 1
            : -1;

        }


        return 0;

      }
    );

  }


  /* =======================================================
     SORT VALUE
     ======================================================= */

  private getSortValue(
    appointment: AppointmentRow,
    column: string
  ): string | number {

    switch (column) {

      case 'id':

        return appointment.id ?? 0;


      case 'patient':

        return appointment.patientName
          .toLowerCase();


      case 'doctor':

        return appointment.doctorName
          .toLowerCase();


      case 'appointmentDate':

        return appointment.appointmentDate;


      case 'appointmentTime':

        return appointment.appointmentTime;


      case 'reason':

        return appointment.reason
          .toLowerCase();


      case 'status':

        return appointment.status
          .toLowerCase();


      default:

        return '';

    }

  }


  /* =======================================================
     SORT ICON
     ======================================================= */

  getSortIcon(
    column: string
  ): string {

    if (
      this.sortColumn !== column
    ) {

      return '↕';

    }

    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';

  }


  /* =======================================================
     PAGINATION
     ======================================================= */

  get totalRecords(): number {

    return this.filteredAppointments.length;

  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.totalRecords /
        this.pageSize
      )
    );

  }


  get pages(): number[] {

    const result: number[] = [];

    for (
      let page = 1;
      page <= this.totalPages;
      page++
    ) {

      result.push(page);

    }

    return result;

  }


  get paginatedAppointments():
    AppointmentRow[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;

    return this.filteredAppointments.slice(
      start,
      end
    );

  }


  get startRecord(): number {

    if (
      this.totalRecords === 0
    ) {

      return 0;

    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;

  }


  get endRecord(): number {

    return Math.min(
      this.currentPage *
        this.pageSize,
      this.totalRecords
    );

  }


  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;

    }

  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  goToPage(
    page: number
  ): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {

      this.currentPage = page;

    }

  }


  onPageSizeChange(): void {

    this.currentPage = 1;

    this.fixCurrentPage();

  }


  private fixCurrentPage(): void {

    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }

  }


  /* =======================================================
     ADD APPOINTMENT
     ======================================================= */

  openAddAppointmentModal(): void {

    this.clearForm();

    this.editingId = null;

    this.showAppointmentModal = true;

  }


  /* =======================================================
     EDIT APPOINTMENT
     ======================================================= */

  openEditAppointmentModal(
    appointment: AppointmentRow
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
      this.formatTimeForInput(
        appointment.appointmentTime
      );

    this.reason =
      appointment.reason;

    this.status =
      appointment.status ||
      'SCHEDULED';

    this.showAppointmentModal = true;

  }


  /* =======================================================
     CLOSE APPOINTMENT MODAL
     ======================================================= */

  closeAppointmentModal(): void {

    if (
      this.saving
    ) {

      return;

    }

    this.showAppointmentModal = false;

    this.clearForm();

  }


  /* =======================================================
     SAVE APPOINTMENT
     ======================================================= */

  saveAppointment(): void {

    if (
      this.patientId === null ||
      this.patientId === undefined
    ) {

      this.showError(
        'Please select a patient.'
      );

      return;

    }


    if (
      this.doctorId === null ||
      this.doctorId === undefined
    ) {

      this.showError(
        'Please select a doctor.'
      );

      return;

    }


    if (
      !this.appointmentDate.trim()
    ) {

      this.showError(
        'Please select appointment date.'
      );

      return;

    }


    if (
      !this.appointmentTime.trim()
    ) {

      this.showError(
        'Please select appointment time.'
      );

      return;

    }


    if (
      !this.reason.trim()
    ) {

      this.showError(
        'Please enter appointment reason.'
      );

      return;

    }


    if (
      !this.status.trim()
    ) {

      this.showError(
        'Please select appointment status.'
      );

      return;

    }


    const request:
      AppointmentRequest = {

      patientId:
        Number(
          this.patientId
        ),

      doctorId:
        Number(
          this.doctorId
        ),

      appointmentDate:
        this.appointmentDate,

      appointmentTime:
        this.appointmentTime.length === 5
          ? this.appointmentTime + ':00'
          : this.appointmentTime,

      reason:
        this.reason.trim(),

      status:
        this.status

    };


    console.log(
      'Appointment request:',
      request
    );


    this.saving = true;


    if (
      this.editingId === null
    ) {

      this.appointmentService
        .createAppointment(request)
        .subscribe({

          next: () => {

            this.saving = false;

            this.showAppointmentModal =
              false;

            this.clearForm();

            this.showSuccess(
              'Appointment created successfully.'
            );

            this.loadAppointments();

          },

          error: (
            error: HttpErrorResponse
          ) => {

            this.saving = false;

            console.error(
              'Create appointment error:',
              error
            );

            this.handleAppointmentError(
              error,
              'Failed to create appointment.'
            );

          }

        });

    } else {

      this.appointmentService
        .updateAppointment(
          this.editingId,
          request
        )
        .subscribe({

          next: () => {

            this.saving = false;

            this.showAppointmentModal =
              false;

            this.clearForm();

            this.showSuccess(
              'Appointment updated successfully.'
            );

            this.loadAppointments();

          },

          error: (
            error: HttpErrorResponse
          ) => {

            this.saving = false;

            console.error(
              'Update appointment error:',
              error
            );

            this.handleAppointmentError(
              error,
              'Failed to update appointment.'
            );

          }

        });

    }

  }


  /* =======================================================
     OPEN DELETE MODAL
     ======================================================= */

  openDeleteModal(
    appointment: AppointmentRow
  ): void {

    this.selectedAppointment =
      appointment;

    this.showDeleteModal = true;

  }


  /* =======================================================
     CLOSE DELETE MODAL
     ======================================================= */

  closeDeleteModal(): void {

    if (
      this.deleting
    ) {

      return;

    }

    this.showDeleteModal = false;

    this.selectedAppointment =
      null;

  }


  /* =======================================================
     CONFIRM DELETE
     ======================================================= */

  confirmDeleteAppointment(): void {

    if (
      !this.selectedAppointment?.id
    ) {

      return;

    }


    this.deleting = true;


    this.appointmentService
      .deleteAppointment(
        this.selectedAppointment.id
      )
      .subscribe({

        next: () => {

          this.deleting = false;

          this.showDeleteModal =
            false;

          this.showSuccess(
            'Appointment deleted successfully.'
          );

          this.selectedAppointment =
            null;

          this.loadAppointments();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.deleting = false;

          console.error(
            'Delete appointment error:',
            error
          );

          this.handleAppointmentError(
            error,
            'Failed to delete appointment.'
          );

        }

      });

  }


  /* =======================================================
     CLEAR FORM
     ======================================================= */

  clearForm(): void {

    this.patientId = null;

    this.doctorId = null;

    this.appointmentDate = '';

    this.appointmentTime = '';

    this.reason = '';

    this.status = 'SCHEDULED';

    this.editingId = null;

  }


  /* =======================================================
     FORMAT TIME
     ======================================================= */

  private formatTimeForInput(
    time: any
  ): string {

    if (
      !time
    ) {

      return '';

    }


    const value =
      String(time);


    if (
      value.length >= 5
    ) {

      return value.substring(
        0,
        5
      );

    }


    return value;

  }


  /* =======================================================
     ERROR HANDLING
     ======================================================= */

  private handleAppointmentError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): void {

    let message =
      defaultMessage;


    if (
      error.status === 401
    ) {

      message =
        'Please login again.';

    } else if (
      error.status === 403
    ) {

      message =
        'You do not have permission for this operation.';

    } else if (
      error.status === 409
    ) {

      message =
        'Appointment already exists for this doctor, date and time.';

    } else if (
      typeof error.error === 'string' &&
      error.error.trim()
    ) {

      message =
        error.error;

    } else if (
      error.error?.message
    ) {

      message =
        error.error.message;

    } else if (
      error.error?.error
    ) {

      message =
        error.error.error;

    }


    this.showError(
      message
    );

  }


  /* =======================================================
     SUCCESS MESSAGE
     ======================================================= */

  private showSuccess(
    message: string
  ): void {

    this.popupType =
      'success';

    this.popupMessage =
      message;

    this.showPopup =
      true;


    setTimeout(
      () => {

        this.showPopup =
          false;

      },
      3500
    );

  }


  /* =======================================================
     ERROR MESSAGE
     ======================================================= */

  private showError(
    message: string
  ): void {

    this.popupType =
      'error';

    this.popupMessage =
      message;

    this.showPopup =
      true;


    setTimeout(
      () => {

        this.showPopup =
          false;

      },
      4500
    );

  }

}