import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DoctorService } from '../../../services/doctor.service';
import { Modal } from '../../../shared/modal/modal';


/*
 * Doctor model used by this page.
 */
interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  experience: number;
  deleted?: boolean;
}


type SortColumn =
  | 'id'
  | 'name'
  | 'specialization'
  | 'phone'
  | 'email'
  | 'experience';


type SortDirection = 'asc' | 'desc';


@Component({
  selector: 'app-doctors',

  imports: [
    FormsModule,
    Modal
  ],

  templateUrl: './doctors.html',

  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {

  private doctorService = inject(DoctorService);

  private router = inject(Router);


  // =========================================================
  // DOCTOR DATA
  // =========================================================

  doctors: Doctor[] = [];

  filteredDoctors: Doctor[] = [];

  paginatedDoctors: Doctor[] = [];


  // =========================================================
  // SINGLE DOCTOR FORM OBJECT
  // =========================================================

  doctor: Doctor = this.createEmptyDoctor();


  // =========================================================
  // EDITING
  // =========================================================

  editingId: number | null = null;


  // =========================================================
  // LOADING
  // =========================================================

  loading = false;

  saving = false;

  deleting = false;


  // =========================================================
  // GLOBAL SEARCH
  // =========================================================

  searchTerm = '';


  // =========================================================
  // TOP SPECIALIZATION FILTER
  // =========================================================

  specializationFilter = 'ALL';

  specializations: string[] = [];


  // =========================================================
  // COLUMN FILTERS
  // =========================================================

  columnIdFilter = '';

  columnNameFilter = '';

  columnSpecializationFilter = 'ALL';

  columnPhoneFilter = '';

  columnEmailFilter = '';

  columnExperienceFilter = '';


  // =========================================================
  // SORTING
  // =========================================================

  sortColumn: SortColumn = 'id';

  sortDirection: SortDirection = 'desc';


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  pageSize = 5;


  // =========================================================
  // MODALS
  // =========================================================

  showDoctorModal = false;

  showDeleteModal = false;


  deleteDoctorName = '';

  selectedDoctor: Doctor | null = null;


  // =========================================================
  // MESSAGE
  // =========================================================

  message = '';

  messageType: 'success' | 'error' | '' = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadDoctors();

  }


  // =========================================================
  // EMPTY DOCTOR
  // =========================================================

  private createEmptyDoctor(): Doctor {

    return {

      id: undefined,

      name: '',

      specialization: '',

      phone: '',

      email: '',

      experience: 0,

      deleted: false

    };

  }


  // =========================================================
  // LOAD DOCTORS
  // =========================================================

  loadDoctors(): void {

    this.loading = true;

    this.doctorService.getDoctors().subscribe({

      next: (data: Doctor[]) => {

        /*
         * Hide soft-deleted doctors.
         */
        this.doctors = data.filter(
          doctor => !doctor.deleted
        );


        this.buildSpecializations();

        this.applyFilters();


        this.loading = false;

      },


      error: (error: unknown) => {

        console.error(
          'Error loading doctors:',
          error
        );


        this.loading = false;


        this.showMessage(
          'Unable to load doctors.',
          'error'
        );

      }

    });

  }


  // =========================================================
  // REFRESH
  // =========================================================

  refreshDoctors(): void {

    this.loadDoctors();

  }


  // =========================================================
  // BACK TO DASHBOARD
  // =========================================================

  backToDashboard(): void {

    this.router.navigate(['/admin']);

  }


  // =========================================================
  // BUILD SPECIALIZATION LIST
  // =========================================================

  private buildSpecializations(): void {

    const values = this.doctors

      .map(
        doctor =>
          doctor.specialization?.trim()
      )

      .filter(
        (value): value is string =>
          !!value
      );


    this.specializations = Array.from(
      new Set(values)
    ).sort();

  }


  // =========================================================
  // GLOBAL SEARCH CHANGE
  // =========================================================

  onSearchChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // TOP FILTER CHANGE
  // =========================================================

  onFilterChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // COLUMN FILTER CHANGE
  // =========================================================

  onColumnFilterChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // CLEAR ALL COLUMN FILTERS
  // =========================================================

  clearColumnFilters(): void {

    this.columnIdFilter = '';

    this.columnNameFilter = '';

    this.columnSpecializationFilter = 'ALL';

    this.columnPhoneFilter = '';

    this.columnEmailFilter = '';

    this.columnExperienceFilter = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // CLEAR GLOBAL SEARCH
  // =========================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.onSearchChange();

  }


  // =========================================================
  // APPLY ALL FILTERS
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    const idFilter =
      this.columnIdFilter
        .trim()
        .toLowerCase();


    const nameFilter =
      this.columnNameFilter
        .trim()
        .toLowerCase();


    const phoneFilter =
      this.columnPhoneFilter
        .trim()
        .toLowerCase();


    const emailFilter =
      this.columnEmailFilter
        .trim()
        .toLowerCase();


    const experienceFilter =
      this.columnExperienceFilter
        .trim()
        .toLowerCase();


    this.filteredDoctors =
      this.doctors.filter(
        doctor => {

          // =================================================
          // GLOBAL SEARCH
          // =================================================

          const matchesSearch =

            !search ||

            String(
              doctor.id ?? ''
            )
              .toLowerCase()
              .includes(search) ||

            doctor.name
              .toLowerCase()
              .includes(search) ||

            doctor.specialization
              .toLowerCase()
              .includes(search) ||

            doctor.phone
              .toLowerCase()
              .includes(search) ||

            doctor.email
              .toLowerCase()
              .includes(search) ||

            String(
              doctor.experience
            )
              .toLowerCase()
              .includes(search);


          // =================================================
          // ID COLUMN FILTER
          // =================================================

          const matchesId =

            !idFilter ||

            String(
              doctor.id ?? ''
            )
              .toLowerCase()
              .includes(idFilter);


          // =================================================
          // NAME COLUMN FILTER
          // =================================================

          const matchesName =

            !nameFilter ||

            doctor.name
              .toLowerCase()
              .includes(nameFilter);


          // =================================================
          // SPECIALIZATION COLUMN FILTER
          // =================================================

          const matchesColumnSpecialization =

            this.columnSpecializationFilter === 'ALL' ||

            doctor.specialization ===
              this.columnSpecializationFilter;


          // =================================================
          // PHONE COLUMN FILTER
          // =================================================

          const matchesPhone =

            !phoneFilter ||

            doctor.phone
              .toLowerCase()
              .includes(phoneFilter);


          // =================================================
          // EMAIL COLUMN FILTER
          // =================================================

          const matchesEmail =

            !emailFilter ||

            doctor.email
              .toLowerCase()
              .includes(emailFilter);


          // =================================================
          // EXPERIENCE COLUMN FILTER
          // =================================================

          const matchesExperience =

            !experienceFilter ||

            String(
              doctor.experience
            )
              .toLowerCase()
              .includes(experienceFilter);


          return (

            matchesSearch &&

            matchesId &&

            matchesName &&

            matchesColumnSpecialization &&

            matchesPhone &&

            matchesEmail &&

            matchesExperience

          );

        }
      );


    this.applySorting();

    this.updatePagination();

  }


  // =========================================================
  // SORT
  // =========================================================

  sortBy(column: SortColumn): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }


    this.applySorting();

    this.updatePagination();

  }


  // =========================================================
  // APPLY SORTING
  // =========================================================

  private applySorting(): void {

    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;


    this.filteredDoctors.sort(
      (a, b) => {

        if (
          this.sortColumn === 'id' ||
          this.sortColumn === 'experience'
        ) {

          const valueA =
            Number(
              a[this.sortColumn] ?? 0
            );


          const valueB =
            Number(
              b[this.sortColumn] ?? 0
            );


          return (
            (valueA - valueB) *
            direction
          );

        }


        const valueA =
          String(
            a[this.sortColumn] ?? ''
          ).toLowerCase();


        const valueB =
          String(
            b[this.sortColumn] ?? ''
          ).toLowerCase();


        return (
          valueA.localeCompare(valueB) *
          direction
        );

      }
    );

  }


  // =========================================================
  // EDIT DOCTOR
  // =========================================================

  editDoctor(doctor: Doctor): void {

    this.editingId =
      doctor.id ?? null;


    this.doctor = {

      id: doctor.id,

      name: doctor.name,

      specialization:
        doctor.specialization,

      phone: doctor.phone,

      email: doctor.email,

      experience:
        doctor.experience,

      deleted:
        doctor.deleted

    };


    this.showDoctorModal = true;

  }


  // =========================================================
  // OPEN ADD DOCTOR MODAL
  // =========================================================

  openAddDoctorModal(): void {

    this.editingId = null;

    this.selectedDoctor = null;

    this.doctor =
      this.createEmptyDoctor();


    this.showDoctorModal = true;

  }


  // =========================================================
  // CLOSE DOCTOR MODAL
  // =========================================================

  closeDoctorModal(): void {

    if (this.saving) {

      return;

    }


    this.showDoctorModal = false;

    this.editingId = null;

    this.selectedDoctor = null;

    this.doctor =
      this.createEmptyDoctor();

  }


  // =========================================================
  // SUBMIT DOCTOR
  // =========================================================

  submitDoctor(): void {

    if (!this.isDoctorValid()) {

      this.showMessage(
        'Please fill all required fields.',
        'error'
      );

      return;

    }


    this.saving = true;


    const doctorPayload: Doctor = {

      name:
        this.doctor.name.trim(),

      specialization:
        this.doctor.specialization.trim(),

      phone:
        this.doctor.phone.trim(),

      email:
        this.doctor.email.trim(),

      experience:
        Number(this.doctor.experience),

      deleted: false

    };


    // =======================================================
    // ADD DOCTOR
    // =======================================================

    if (this.editingId === null) {

      this.doctorService
        .createDoctor(doctorPayload)
        .subscribe({

          next: (createdDoctor: Doctor) => {

            /*
             * IMPORTANT:
             * Do not call loadDoctors().
             *
             * The backend already returns the newly
             * created doctor. Add it directly to the
             * local array.
             */

            this.doctors = [
              ...this.doctors,
              createdDoctor
            ];


            /*
             * Rebuild specialization filter because
             * a new specialization may have been added.
             */

            this.buildSpecializations();


            /*
             * Reapply search, filters, sorting and
             * pagination without another HTTP GET.
             */

            this.applyFilters();


            this.saving = false;

            this.closeDoctorModal();


            this.showMessage(
              'Doctor added successfully.',
              'success'
            );

          },


          error: (error: unknown) => {

            console.error(
              'Error creating doctor:',
              error
            );


            this.saving = false;


            this.showMessage(
              'Unable to add doctor.',
              'error'
            );

          }

        });


      return;

    }


    // =======================================================
    // UPDATE DOCTOR
    // =======================================================

    const doctorId =
      this.editingId;


    this.doctorService
      .updateDoctor(
        doctorId,
        doctorPayload
      )
      .subscribe({

        next: (updatedDoctor: Doctor) => {

          /*
           * Find the updated doctor in the local array.
           */

          const index =
            this.doctors.findIndex(
              existingDoctor =>
                existingDoctor.id ===
                updatedDoctor.id
            );


          /*
           * Replace only that doctor.
           */

          if (index !== -1) {

            this.doctors[index] =
              updatedDoctor;

          }


          /*
           * Rebuild specialization list because
           * specialization may have changed.
           */

          this.buildSpecializations();


          /*
           * Reapply filters/sorting/pagination
           * without calling GET again.
           */

          this.applyFilters();


          this.saving = false;

          this.closeDoctorModal();


          this.showMessage(
            'Doctor updated successfully.',
            'success'
          );

        },


        error: (error: unknown) => {

          console.error(
            'Error updating doctor:',
            error
          );


          this.saving = false;


          this.showMessage(
            'Unable to update doctor.',
            'error'
          );

        }

      });

  }


  // =========================================================
  // VALIDATE DOCTOR
  // =========================================================

  private isDoctorValid(): boolean {

    return (

      this.doctor.name.trim().length > 0 &&

      this.doctor.specialization
        .trim()
        .length > 0 &&

      this.doctor.phone.trim().length > 0 &&

      this.doctor.email.trim().length > 0 &&

      Number(this.doctor.experience) >= 0

    );

  }


  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  openDeleteModal(doctor: Doctor): void {

    this.selectedDoctor = doctor;

    this.deleteDoctorName =
      doctor.name;

    this.showDeleteModal = true;

  }


  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  closeDeleteModal(): void {

    if (this.deleting) {

      return;

    }


    this.showDeleteModal = false;

    this.selectedDoctor = null;

    this.deleteDoctorName = '';

  }


  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  confirmDeleteDoctor(): void {

    if (!this.selectedDoctor?.id) {

      return;

    }


    this.deleting = true;


    const doctorId =
      this.selectedDoctor.id;


    this.doctorService
      .deleteDoctor(doctorId)
      .subscribe({

        next: () => {

          /*
           * Soft delete succeeded on the backend.
           *
           * Remove the doctor from the local active
           * doctor array instead of performing another
           * GET request.
           */

          this.doctors =
            this.doctors.filter(
              doctor =>
                doctor.id !== doctorId
            );


          /*
           * Rebuild specialization list because
           * the deleted doctor may have been the
           * only doctor with that specialization.
           */

          this.buildSpecializations();


          /*
           * Reapply filters and pagination.
           */

          this.currentPage = Math.min(
            this.currentPage,
            this.totalPages
          );


          this.applyFilters();


          this.deleting = false;

          this.showDeleteModal = false;

          this.selectedDoctor = null;

          this.deleteDoctorName = '';


          this.showMessage(
            'Doctor deleted successfully.',
            'success'
          );

        },


        error: (error: unknown) => {

          console.error(
            'Error deleting doctor:',
            error
          );


          this.deleting = false;


          this.showMessage(
            'Unable to delete doctor.',
            'error'
          );

        }

      });

  }


  // =========================================================
  // PAGINATION
  // =========================================================

  updatePagination(): void {

    /*
     * Make sure current page is still valid
     * after applying a filter.
     */

    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }


    const start =
      (this.currentPage - 1) *
      this.pageSize;


    const end =
      start + this.pageSize;


    this.paginatedDoctors =
      this.filteredDoctors.slice(
        start,
        end
      );

  }


  // =========================================================
  // CHANGE PAGE
  // =========================================================

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage = page;

    this.updatePagination();

  }


  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }


  // =========================================================
  // NEXT PAGE
  // =========================================================

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();

    }

  }


  // =========================================================
  // PAGE SIZE
  // =========================================================

  onPageSizeChange(): void {

    this.currentPage = 1;

    this.updatePagination();

  }


  // =========================================================
  // TOTAL PAGES
  // =========================================================

  get totalPages(): number {

    return Math.max(

      1,

      Math.ceil(
        this.filteredDoctors.length /
        this.pageSize
      )

    );

  }


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  get pageNumbers(): number[] {

    return Array.from(

      {
        length: this.totalPages
      },

      (_, index) =>
        index + 1

    );

  }


  // =========================================================
  // START RECORD
  // =========================================================

  get startRecord(): number {

    if (
      this.filteredDoctors.length === 0
    ) {

      return 0;

    }


    return (

      (this.currentPage - 1) *
      this.pageSize

    ) + 1;

  }


  // =========================================================
  // END RECORD
  // =========================================================

  get endRecord(): number {

    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredDoctors.length

    );

  }


  // =========================================================
  // SORT ICON
  // =========================================================

  getSortIcon(
    column: SortColumn
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


  // =========================================================
  // MESSAGE
  // =========================================================

  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.message = message;

    this.messageType = type;


    setTimeout(() => {

      this.message = '';

      this.messageType = '';

    }, 3500);

  }

}