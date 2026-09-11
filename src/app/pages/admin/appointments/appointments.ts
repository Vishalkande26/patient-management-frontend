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

  /*
   * Frontend-only property.
   *
   * Used while Add / Update is running
   * in the background.
   */
  isSaving?: boolean;

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

  standalone: true,

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
     CACHE
     ======================================================= */

  private readonly cacheKey =
    'appointments';


  /* =======================================================
     DATA
     ======================================================= */

  appointments: AppointmentRow[] = [];

  patients: Patient[] = [];

  doctors: Doctor[] = [];

  filteredAppointments: AppointmentRow[] = [];


  /* =======================================================
     LOADING STATES
     ======================================================= */

  /*
   * Full-page loading is only used when
   * there is no cached appointment data.
   */

  loading = false;

  /*
   * Used for Add / Update.
   */

  saving = false;

  /*
   * Used for Delete.
   */

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

  selectedAppointment:
    AppointmentRow | null = null;


  /* =======================================================
     TOAST
     ======================================================= */

  showPopup = false;

  popupMessage = '';

  popupType:
    'success'
    | 'error'
    = 'success';

  private popupTimer:
    ReturnType<typeof setTimeout>
    | null = null;


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

  sortColumn =
    'appointmentDate';

  sortDirection:
    'asc'
    | 'desc'
    = 'desc';


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
     BACKUP DATA
     ======================================================= */

  private updatingAppointmentBackup:
    AppointmentRow
    | undefined;

  private deletedAppointmentBackup:
    AppointmentRow
    | undefined;

  private temporaryAppointment:
    AppointmentRow
    | undefined;


  /* =======================================================
     INITIALIZE
     ======================================================= */

  ngOnInit(): void {

    /*
     * Load patients and doctors.
     *
     * These do not control the main appointment
     * table loading indicator.
     */

    this.loadPatients();

    this.loadDoctors();


    /*
     * Load appointments using cache-first approach.
     */

    this.initializeAppointments();
  }


  /* =======================================================
     INITIALIZE APPOINTMENTS
     ======================================================= */

  private initializeAppointments(): void {

    /*
     * Read cached appointments first.
     */

    const cachedAppointments =
      this.getCachedAppointments();


    if (
      cachedAppointments.length > 0
    ) {

      this.appointments =
        cachedAppointments;


      /*
       * Show table immediately.
       */

      this.applyFilters();

      this.fixCurrentPage();


      /*
       * Do NOT show loading.
       */

      this.loading = false;

    } else {

      /*
       * No cache.
       *
       * Show loading only on first load.
       */

      this.loading = true;
    }


    /*
     * Get latest data from backend
     * in the background.
     */

    this.loadAppointments();
  }


  /* =======================================================
     LOAD APPOINTMENTS
     ======================================================= */

  loadAppointments(): void {

    /*
     * Only show full loading when
     * there is no existing data.
     */

    if (
      this.appointments.length === 0
    ) {

      this.loading = true;
    }


    this.appointmentService
      .getAppointments()
      .subscribe({

        next: (
          data: any[]
        ) => {

          console.log(
            'Appointments loaded:',
            data
          );


          /*
           * Do not overwrite an optimistic
           * Add / Update / Delete operation.
           */

          if (
            this.saving ||
            this.deleting
          ) {

            this.loading = false;

            return;
          }


          this.appointments =
            (data ?? []).map(
              appointment =>
                this.mapAppointment(
                  appointment
                )
            );


          /*
           * Save latest data to cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          /*
           * Update UI.
           */

          this.applyFilters();

          this.fixCurrentPage();


          this.loading = false;
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading appointments:',
            error
          );


          this.loading = false;


          /*
           * If cached data exists,
           * keep displaying it.
           */

          if (
            this.appointments.length > 0
          ) {

            this.applyFilters();

            this.fixCurrentPage();

            return;
          }


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
        'SCHEDULED',

      isSaving:
        false

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

          this.patients =
            data ?? [];
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

          this.doctors =
            data ?? [];
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

    /*
     * Manual refresh.
     *
     * Existing table remains visible while
     * latest data is fetched.
     */

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

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';
    }


    this.applySorting();
  }


  /* =======================================================
     APPLY SORTING
     ======================================================= */

  applySorting(): void {

    /*
     * Create a new array so that the
     * original appointment list remains stable.
     */

    this.filteredAppointments =
      [...this.filteredAppointments];


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

      this.currentPage =
        page;
    }
  }


  onPageSizeChange(
    event?: Event
  ): void {

    /*
     * Supports both:
     *
     * (change)="onPageSizeChange($event)"
     *
     * and:
     *
     * (change)="onPageSizeChange()"
     */

    if (event) {

      const target =
        event.target as HTMLSelectElement;


      const newSize =
        Number(
          target.value
        );


      if (
        Number.isFinite(newSize) &&
        newSize > 0
      ) {

        this.pageSize =
          newSize;
      }
    }


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


    if (
      this.currentPage < 1
    ) {

      this.currentPage = 1;
    }
  }


  /* =======================================================
     ADD APPOINTMENT
     ======================================================= */

  openAddAppointmentModal(): void {

    /*
     * No API call.
     *
     * Modal opens immediately.
     */

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

    /*
     * Do not edit while optimistic
     * operation is running.
     */

    if (
      appointment.isSaving
    ) {

      return;
    }


    if (
      appointment.id === undefined
    ) {

      return;
    }


    this.editingId =
      appointment.id;


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


    /*
     * Modal opens immediately.
     */

    this.showAppointmentModal =
      true;
  }


  /* =======================================================
     CLOSE APPOINTMENT MODAL
     ======================================================= */

  closeAppointmentModal(): void {

    /*
     * Close immediately.
     */

    this.showAppointmentModal =
      false;


    this.clearForm();
  }


  /* =======================================================
     SAVE APPOINTMENT
     ======================================================= */

  saveAppointment(): void {

    if (
      this.saving
    ) {

      return;
    }


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       REQUEST
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       CREATE
       ----------------------------------------------------- */

    if (
      this.editingId === null
    ) {

      this.createAppointmentOptimistically(
        request
      );

      return;
    }


    /* -----------------------------------------------------
       UPDATE
       ----------------------------------------------------- */

    this.updateAppointmentOptimistically(
      this.editingId,
      request
    );
  }


  /* =======================================================
     OPTIMISTIC CREATE
     ======================================================= */

  private createAppointmentOptimistically(
    request: AppointmentRequest
  ): void {

    if (
      this.saving
    ) {

      return;
    }


    this.saving = true;


    /*
     * Find patient information for
     * immediate table display.
     */

    const patient =
      this.patients.find(
        item =>
          item.id ===
          request.patientId
      );


    /*
     * Find doctor information for
     * immediate table display.
     */

    const doctor =
      this.doctors.find(
        item =>
          item.id ===
          request.doctorId
      );


    /*
     * IMPORTANT:
     *
     * Do NOT create a fake ID.
     */

    const temporaryAppointment:
      AppointmentRow = {

      patientId:
        request.patientId,

      patientName:
        patient?.name ??
        'Loading Patient...',

      patientDisease:
        patient?.disease ??
        '',

      patientAddress:
        patient?.address ??
        '',

      doctorId:
        request.doctorId,

      doctorName:
        doctor?.name ??
        'Loading Doctor...',

      doctorSpecialization:
        doctor?.specialization ??
        '',

      appointmentDate:
        request.appointmentDate,

      appointmentTime:
        this.formatTimeForInput(
          request.appointmentTime
        ),

      reason:
        request.reason,

      status:
        request.status,

      isSaving:
        true
    };


    this.temporaryAppointment =
      temporaryAppointment;


    /*
     * Add immediately to table.
     */

    this.appointments = [
      ...this.appointments,
      temporaryAppointment
    ];


    /*
     * Update UI immediately.
     */

    this.applyFilters();


    /*
     * Go to last page so the new
     * appointment is visible.
     */

    this.currentPage =
      this.totalPages;


    this.fixCurrentPage();


    /*
     * Close modal immediately.
     */

    this.closeAppointmentModal();


    /*
     * Backend request runs in
     * the background.
     */

    this.appointmentService
      .createAppointment(request)
      .subscribe({

        next: (
          createdAppointment: any
        ) => {

          /*
           * Convert backend response.
           */

          const created =
            this.mapAppointment(
              createdAppointment
            );


          /*
           * Replace temporary row
           * with real backend row.
           */

          this.appointments =
            this.appointments.map(
              appointment =>
                appointment ===
                temporaryAppointment
                  ? created
                  : appointment
            );


          /*
           * Save cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          this.temporaryAppointment =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.showSuccess(
            'Appointment created successfully.'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Create appointment error:',
            error
          );


          /*
           * Remove optimistic row.
           */

          this.appointments =
            this.appointments.filter(
              appointment =>
                appointment !==
                temporaryAppointment
            );


          this.temporaryAppointment =
            undefined;


          /*
           * Update cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.handleAppointmentError(
            error,
            'Failed to create appointment.'
          );
        }

      });
  }


  /* =======================================================
     OPTIMISTIC UPDATE
     ======================================================= */

  private updateAppointmentOptimistically(
    id: number,
    request: AppointmentRequest
  ): void {

    if (
      this.saving
    ) {

      return;
    }


    /*
     * Find current appointment.
     */

    const existingAppointment =
      this.appointments.find(
        appointment =>
          appointment.id === id
      );


    if (
      !existingAppointment
    ) {

      this.showError(
        'Appointment not found.'
      );

      return;
    }


    /*
     * Backup old appointment.
     */

    this.updatingAppointmentBackup =
      {
        ...existingAppointment,
        isSaving: false
      };


    /*
     * Find latest patient information.
     */

    const patient =
      this.patients.find(
        item =>
          item.id ===
          request.patientId
      );


    /*
     * Find latest doctor information.
     */

    const doctor =
      this.doctors.find(
        item =>
          item.id ===
          request.doctorId
      );


    /*
     * Create optimistic updated row.
     */

    const updatedAppointment:
      AppointmentRow = {

      id:
        id,

      patientId:
        request.patientId,

      patientName:
        patient?.name ??
        existingAppointment.patientName,

      patientDisease:
        patient?.disease ??
        existingAppointment.patientDisease,

      patientAddress:
        patient?.address ??
        existingAppointment.patientAddress,

      doctorId:
        request.doctorId,

      doctorName:
        doctor?.name ??
        existingAppointment.doctorName,

      doctorSpecialization:
        doctor?.specialization ??
        existingAppointment.doctorSpecialization,

      appointmentDate:
        request.appointmentDate,

      appointmentTime:
        this.formatTimeForInput(
          request.appointmentTime
        ),

      reason:
        request.reason,

      status:
        request.status,

      isSaving:
        true
    };


    /*
     * Update table immediately.
     */

    this.appointments =
      this.appointments.map(
        appointment =>
          appointment.id === id
            ? updatedAppointment
            : appointment
      );


    this.applyFilters();

    this.fixCurrentPage();


    /*
     * Close modal immediately.
     */

    this.closeAppointmentModal();


    this.saving = true;


    /*
     * Backend PUT runs in background.
     */

    this.appointmentService
      .updateAppointment(
        id,
        request
      )
      .subscribe({

        next: (
          responseAppointment: any
        ) => {

          /*
           * Replace optimistic row
           * with backend response.
           */

          const updated =
            this.mapAppointment(
              responseAppointment
            );


          this.appointments =
            this.appointments.map(
              appointment =>
                appointment.id === id
                  ? updated
                  : appointment
            );


          /*
           * Save cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          this.updatingAppointmentBackup =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.showSuccess(
            'Appointment updated successfully.'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Update appointment error:',
            error
          );


          /*
           * Restore old appointment.
           */

          if (
            this.updatingAppointmentBackup
          ) {

            this.appointments =
              this.appointments.map(
                appointment =>
                  appointment.id === id
                    ? this.updatingAppointmentBackup!
                    : appointment
              );
          }


          /*
           * Update cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          this.updatingAppointmentBackup =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.handleAppointmentError(
            error,
            'Failed to update appointment.'
          );
        }

      });
  }


  /* =======================================================
     OPEN DELETE MODAL
     ======================================================= */

  openDeleteModal(
    appointment: AppointmentRow
  ): void {

    /*
     * Do not delete temporary/saving row.
     */

    if (
      appointment.isSaving
    ) {

      return;
    }


    if (
      appointment.id === undefined
    ) {

      return;
    }


    this.selectedAppointment =
      appointment;


    /*
     * Modal opens immediately.
     */

    this.showDeleteModal =
      true;
  }


  /* =======================================================
     CLOSE DELETE MODAL
     ======================================================= */

  closeDeleteModal(): void {

    /*
     * Close immediately.
     */

    this.showDeleteModal =
      false;


    this.selectedAppointment =
      null;
  }


  /* =======================================================
     DELETE APPOINTMENT
     ======================================================= */

  confirmDeleteAppointment(): void {

    if (
      this.deleting
    ) {

      return;
    }


    const appointment =
      this.selectedAppointment;


    if (
      !appointment ||
      appointment.id === undefined
    ) {

      this.showError(
        'Appointment ID is missing.'
      );

      return;
    }


    const id =
      appointment.id;


    /*
     * Backup appointment.
     */

    this.deletedAppointmentBackup =
      {
        ...appointment,
        isSaving: false
      };


    /*
     * Close confirmation immediately.
     */

    this.showDeleteModal =
      false;


    this.selectedAppointment =
      null;


    /*
     * Remove appointment immediately.
     */

    this.appointments =
      this.appointments.filter(
        item =>
          item.id !== id
      );


    /*
     * Update UI immediately.
     */

    this.applyFilters();

    this.fixCurrentPage();


    /*
     * Update cache immediately.
     */

    this.setCachedAppointments(
      this.appointments
    );


    this.deleting = true;


    /*
     * Backend DELETE runs in
     * the background.
     */

    this.appointmentService
      .deleteAppointment(id)
      .subscribe({

        next: () => {

          this.deletedAppointmentBackup =
            undefined;


          this.deleting =
            false;


          /*
           * IMPORTANT:
           *
           * No loadAppointments() here.
           */

          this.showSuccess(
            'Appointment deleted successfully.'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Delete appointment error:',
            error
          );


          /*
           * Rollback deleted appointment.
           */

          if (
            this.deletedAppointmentBackup
          ) {

            this.appointments = [
              ...this.appointments,
              this.deletedAppointmentBackup
            ];
          }


          /*
           * Update cache.
           */

          this.setCachedAppointments(
            this.appointments
          );


          this.deletedAppointmentBackup =
            undefined;


          this.deleting =
            false;


          this.applyFilters();

          this.fixCurrentPage();


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
     CACHE - GET
     ======================================================= */

  private getCachedAppointments():
    AppointmentRow[] {

    const data =
      localStorage.getItem(
        this.cacheKey
      );


    if (
      !data
    ) {

      return [];
    }


    try {

      const appointments =
        JSON.parse(data);


      if (
        Array.isArray(
          appointments
        )
      ) {

        return appointments;
      }


      return [];

    } catch {

      return [];
    }
  }


  /* =======================================================
     CACHE - SET
     ======================================================= */

  private setCachedAppointments(
    appointments: AppointmentRow[]
  ): void {

    localStorage.setItem(
      this.cacheKey,
      JSON.stringify(
        appointments
      )
    );
  }


  /* =======================================================
     CLEAR CACHE
     ======================================================= */

  clearAppointmentCache(): void {

    localStorage.removeItem(
      this.cacheKey
    );
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
      error.error?.message &&
      typeof error.error.message === 'string'
    ) {

      message =
        error.error.message;

    } else if (
      error.error?.error &&
      typeof error.error.error === 'string'
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


    this.resetPopupTimer();
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


    this.resetPopupTimer();
  }


  /* =======================================================
     POPUP TIMER
     ======================================================= */

  private resetPopupTimer(): void {

    if (
      this.popupTimer
    ) {

      clearTimeout(
        this.popupTimer
      );
    }


    this.popupTimer =
      setTimeout(() => {

        this.showPopup =
          false;

      }, 4000);
  }

}