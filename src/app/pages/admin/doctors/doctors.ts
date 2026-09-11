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
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

import {
  Modal
} from '../../../shared/modal/modal';


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

  private doctorService =
    inject(DoctorService);

  private router =
    inject(Router);


  // =====================================================
  // DOCTOR FORM
  // =====================================================

  doctor: Doctor = {
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experience: 0
  };


  editingId: number | null = null;


  // =====================================================
  // LOADING STATES
  // =====================================================

  /*
   * Full-page loading is disabled.
   *
   * We don't want the complete doctor table
   * to disappear during CRUD operations.
   */
  loading = false;


  /*
   * Used while Save / Update API request
   * is running.
   */
  saving = false;


  /*
   * Used while Delete API request
   * is running in the background.
   */
  deleting = false;


  // =====================================================
  // MODALS
  // =====================================================

  showDoctorModal = false;

  showDeleteModal = false;


  deleteDoctorId:
    number | undefined = undefined;

  deleteDoctorName = '';


  /*
   * Backup used for optimistic delete.
   *
   * If DELETE fails, the doctor is restored
   * without calling GET doctors again.
   */
  private deletedDoctorBackup:
    Doctor | undefined = undefined;


  // =====================================================
  // MESSAGE
  // =====================================================

  message = '';

  messageType:
    'success' | 'error' = 'success';


  // =====================================================
  // DOCTORS
  // =====================================================

  doctors: Doctor[] = [];


  // =====================================================
  // GLOBAL SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // SPECIALIZATION FILTER
  // =====================================================

  specializationFilter = 'ALL';


  // =====================================================
  // COLUMN FILTERS
  // =====================================================

  columnIdFilter = '';

  columnNameFilter = '';

  columnSpecializationFilter = '';

  columnPhoneFilter = '';

  columnEmailFilter = '';

  columnExperienceFilter = '';


  // =====================================================
  // SORTING
  // =====================================================

  sortField:
    | 'id'
    | 'name'
    | 'specialization'
    | 'experience' = 'id';

  sortDirection:
    'asc' | 'desc' = 'asc';


  // =====================================================
  // PAGINATION
  // =====================================================

  currentPage = 1;

  pageSize = 5;


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadDoctors();

  }


  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  backToDashboard(): void {

    this.router.navigate([
      '/admin'
    ]);

  }


  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  loadDoctors(): void {

    /*
     * IMPORTANT:
     *
     * We don't set loading = true.
     *
     * This keeps the table visible.
     */

    this.doctorService
      .getDoctors()
      .subscribe({

        next: (
          data: Doctor[]
        ) => {

          this.doctors =
            data.filter(
              (
                doctor: Doctor & {
                  deleted?: boolean
                }
              ) =>
                doctor.deleted !== true
            );


          this.fixCurrentPage();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading doctors:',
            error
          );


          if (
            error.status === 401
          ) {

            this.showMessage(
              'Please login again.',
              'error'
            );

          }

          else if (
            error.status === 403
          ) {

            this.showMessage(
              'You are not allowed to view doctors.',
              'error'
            );

          }

          else {

            this.showMessage(
              'Unable to load doctors.',
              'error'
            );

          }

        }

      });

  }


  // =====================================================
  // SPECIALIZATIONS
  // =====================================================

  get specializations(): string[] {

    return [
      ...new Set(

        this.doctors

          .map(
            (
              doctor: Doctor
            ) =>
              doctor.specialization
          )

          .filter(
            (
              value: string
            ) =>
              !!value
          )

      )
    ].sort();

  }


  // =====================================================
  // FILTERED DOCTORS
  // =====================================================

  get filteredDoctors(): Doctor[] {

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


    const specializationColumnFilter =
      this.columnSpecializationFilter
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


    const filtered =
      this.doctors.filter(
        (
          doctor: Doctor
        ) => {

          // ---------------------------------------------
          // GLOBAL SEARCH
          // ---------------------------------------------

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


          // ---------------------------------------------
          // SPECIALIZATION FILTER
          // ---------------------------------------------

          const matchesSpecialization =
            this.specializationFilter === 'ALL' ||

            doctor.specialization ===
              this.specializationFilter;


          // ---------------------------------------------
          // ID FILTER
          // ---------------------------------------------

          const matchesId =
            !idFilter ||

            String(
              doctor.id ?? ''
            )
              .toLowerCase()
              .includes(idFilter);


          // ---------------------------------------------
          // NAME FILTER
          // ---------------------------------------------

          const matchesName =
            !nameFilter ||

            doctor.name
              .toLowerCase()
              .includes(nameFilter);


          // ---------------------------------------------
          // SPECIALIZATION COLUMN FILTER
          // ---------------------------------------------

          const matchesSpecializationColumn =
            !specializationColumnFilter ||

            doctor.specialization
              .toLowerCase()
              .includes(
                specializationColumnFilter
              );


          // ---------------------------------------------
          // PHONE FILTER
          // ---------------------------------------------

          const matchesPhone =
            !phoneFilter ||

            doctor.phone
              .toLowerCase()
              .includes(phoneFilter);


          // ---------------------------------------------
          // EMAIL FILTER
          // ---------------------------------------------

          const matchesEmail =
            !emailFilter ||

            doctor.email
              .toLowerCase()
              .includes(emailFilter);


          // ---------------------------------------------
          // EXPERIENCE FILTER
          // ---------------------------------------------

          const matchesExperience =
            !experienceFilter ||

            String(
              doctor.experience
            )
              .toLowerCase()
              .includes(experienceFilter);


          return (

            matchesSearch &&

            matchesSpecialization &&

            matchesId &&

            matchesName &&

            matchesSpecializationColumn &&

            matchesPhone &&

            matchesEmail &&

            matchesExperience

          );

        }
      );


    // ===================================================
    // SORTING
    // ===================================================

    return [
      ...filtered
    ].sort(
      (
        a: Doctor,
        b: Doctor
      ) => {

        let valueA:
          string | number;

        let valueB:
          string | number;


        switch (
          this.sortField
        ) {

          case 'id':

            valueA =
              a.id ?? 0;

            valueB =
              b.id ?? 0;

            break;


          case 'name':

            valueA =
              a.name.toLowerCase();

            valueB =
              b.name.toLowerCase();

            break;


          case 'specialization':

            valueA =
              a.specialization
                .toLowerCase();

            valueB =
              b.specialization
                .toLowerCase();

            break;


          case 'experience':

            valueA =
              a.experience;

            valueB =
              b.experience;

            break;

        }


        let result = 0;


        if (
          valueA < valueB
        ) {

          result = -1;

        }

        else if (
          valueA > valueB
        ) {

          result = 1;

        }


        return this.sortDirection === 'asc'
          ? result
          : -result;

      }
    );

  }


  // =====================================================
  // PAGINATION
  // =====================================================

  get totalPages(): number {

    return Math.max(
      1,

      Math.ceil(
        this.filteredDoctors.length /
        this.pageSize
      )
    );

  }


  get paginatedDoctors(): Doctor[] {

    const start =
      (
        this.currentPage - 1
      ) *
      this.pageSize;


    const end =
      start +
      this.pageSize;


    return this.filteredDoctors.slice(
      start,
      end
    );

  }


  get startRecord(): number {

    if (
      this.filteredDoctors.length === 0
    ) {

      return 0;

    }


    return (
      (
        this.currentPage - 1
      ) *
      this.pageSize
    ) + 1;

  }


  get endRecord(): number {

    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredDoctors.length

    );

  }


  get pageNumbers(): number[] {

    return Array.from(

      {
        length:
          this.totalPages
      },

      (
        _,
        index
      ) =>
        index + 1

    );

  }


  changePage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage =
      page;

  }


  previousPage(): void {

    this.changePage(
      this.currentPage - 1
    );

  }


  nextPage(): void {

    this.changePage(
      this.currentPage + 1
    );

  }


  onPageSizeChange(): void {

    this.currentPage =
      1;

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

      this.currentPage =
        1;

    }

  }


  // =====================================================
  // SEARCH
  // =====================================================

  onSearchChange(): void {

    this.currentPage =
      1;

  }


  clearSearch(): void {

    this.searchTerm =
      '';

    this.currentPage =
      1;

  }


  // =====================================================
  // FILTER
  // =====================================================

  onFilterChange(): void {

    this.currentPage =
      1;

  }


  // =====================================================
  // COLUMN FILTER
  // =====================================================

  onColumnFilterChange(): void {

    this.currentPage =
      1;

  }


  clearColumnFilters(): void {

    this.columnIdFilter =
      '';

    this.columnNameFilter =
      '';

    this.columnSpecializationFilter =
      '';

    this.columnPhoneFilter =
      '';

    this.columnEmailFilter =
      '';

    this.columnExperienceFilter =
      '';

    this.currentPage =
      1;

  }


  // =====================================================
  // SORT
  // =====================================================

  sortBy(
    field:
      | 'id'
      | 'name'
      | 'specialization'
      | 'experience'
  ): void {

    if (
      this.sortField === field
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    }

    else {

      this.sortField =
        field;

      this.sortDirection =
        'asc';

    }


    this.currentPage =
      1;

  }


  getSortIcon(
    field:
      | 'id'
      | 'name'
      | 'specialization'
      | 'experience'
  ): string {

    if (
      this.sortField !== field
    ) {

      return '↕';

    }


    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';

  }


  // =====================================================
  // CLEAR ALL FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm =
      '';

    this.specializationFilter =
      'ALL';

    this.columnIdFilter =
      '';

    this.columnNameFilter =
      '';

    this.columnSpecializationFilter =
      '';

    this.columnPhoneFilter =
      '';

    this.columnEmailFilter =
      '';

    this.columnExperienceFilter =
      '';

    this.currentPage =
      1;

  }


  // =====================================================
  // ADD DOCTOR
  // =====================================================

  openAddDoctorModal(): void {

    /*
     * No backend request.
     *
     * Modal opens immediately.
     */

    this.resetForm();

    this.editingId =
      null;

    this.showDoctorModal =
      true;

  }


  // =====================================================
  // EDIT DOCTOR
  // =====================================================

  editDoctor(
    doctor: Doctor
  ): void {

    /*
     * No backend request.
     *
     * Edit modal opens immediately.
     */

    this.editingId =
      doctor.id ?? null;


    this.doctor = {

      id:
        doctor.id,

      name:
        doctor.name,

      specialization:
        doctor.specialization,

      phone:
        doctor.phone,

      email:
        doctor.email,

      experience:
        doctor.experience

    };


    this.showDoctorModal =
      true;

  }


  // =====================================================
  // CLOSE DOCTOR MODAL
  // =====================================================

  closeDoctorModal(): void {

    /*
     * Don't close while Save / Update
     * is being processed.
     */

    if (
      this.saving
    ) {

      return;

    }


    this.showDoctorModal =
      false;

  }


  // =====================================================
  // SUBMIT DOCTOR
  // =====================================================

  submitDoctor(): void {

    if (
      this.saving
    ) {

      return;

    }


    // ===================================================
    // REQUIRED FIELDS
    // ===================================================

    if (

      !this.doctor.name.trim() ||

      !this.doctor.specialization.trim() ||

      !this.doctor.phone.trim() ||

      !this.doctor.email.trim()

    ) {

      this.showMessage(
        'Please fill all required fields.',
        'error'
      );

      return;

    }


    // ===================================================
    // PHONE VALIDATION
    // ===================================================

    if (
      !/^[0-9]{10}$/.test(
        this.doctor.phone.trim()
      )
    ) {

      this.showMessage(
        'Phone number must be exactly 10 digits.',
        'error'
      );

      return;

    }


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        this.doctor.email.trim()
      )
    ) {

      this.showMessage(
        'Please enter a valid email address.',
        'error'
      );

      return;

    }


    // ===================================================
    // EXPERIENCE VALIDATION
    // ===================================================

    if (

      this.doctor.experience === null ||

      this.doctor.experience === undefined ||

      Number(
        this.doctor.experience
      ) < 0

    ) {

      this.showMessage(
        'Experience cannot be negative.',
        'error'
      );

      return;

    }


    const doctorRequest: Doctor = {

      name:
        this.doctor.name.trim(),

      specialization:
        this.doctor.specialization.trim(),

      phone:
        this.doctor.phone.trim(),

      email:
        this.doctor.email.trim(),

      experience:
        Number(
          this.doctor.experience
        )

    };


    // ===================================================
    // UPDATE
    // ===================================================

    if (
      this.editingId !== null
    ) {

      this.updateDoctor(
        doctorRequest
      );

      return;

    }


    // ===================================================
    // CREATE
    // ===================================================

    this.createDoctor(
      doctorRequest
    );

  }


  // =====================================================
  // CREATE DOCTOR - OPTIMISTIC UI
  // =====================================================

  private createDoctor(
    doctor: Doctor
  ): void {

    if (
      this.saving
    ) {

      return;

    }


    /*
     * Start the small Save loading state.
     */
    this.saving =
      true;


    // ===================================================
    // TEMPORARY ID
    // ===================================================

    /*
     * Backend generates the real ID.
     *
     * We use a negative temporary ID so it
     * cannot conflict with a normal database ID.
     */
    const temporaryId =
      -Date.now();


    // ===================================================
    // TEMPORARY DOCTOR
    // ===================================================

    const temporaryDoctor: Doctor = {

      id:
        temporaryId,

      name:
        doctor.name,

      specialization:
        doctor.specialization,

      phone:
        doctor.phone,

      email:
        doctor.email,

      experience:
        doctor.experience

    };


    // ===================================================
    // UPDATE TABLE IMMEDIATELY
    // ===================================================

    /*
     * Doctor appears immediately in the UI.
     *
     * No GET request.
     */
    this.doctors = [

      ...this.doctors,

      temporaryDoctor

    ];


    /*
     * Go to the page containing the new doctor.
     */
    this.currentPage =
      this.totalPages;


    // ===================================================
    // CLOSE MODAL IMMEDIATELY
    // ===================================================

    /*
     * This happens BEFORE the HTTP request.
     */
    this.showDoctorModal =
      false;


    /*
     * Reset the form but DON'T change saving.
     */
    this.resetForm();


    // ===================================================
    // BACKGROUND POST REQUEST
    // ===================================================

    this.doctorService
      .createDoctor(
        doctor
      )
      .subscribe({

        next: (
          createdDoctor: Doctor
        ) => {

          // ---------------------------------------------
          // REPLACE TEMPORARY DOCTOR
          // ---------------------------------------------

          this.doctors =
            this.doctors.map(

              (
                item: Doctor
              ) => {

                if (
                  item.id === temporaryId
                ) {

                  return createdDoctor;

                }

                return item;

              }

            );


          // ---------------------------------------------
          // FINISH SAVING
          // ---------------------------------------------

          this.saving =
            false;


          this.fixCurrentPage();


          this.showMessage(
            'Doctor created successfully.',
            'success'
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error creating doctor:',
            error
          );


          // ---------------------------------------------
          // REMOVE TEMPORARY DOCTOR
          // ---------------------------------------------

          /*
           * The database did not save the doctor,
           * therefore remove the temporary UI record.
           */
          this.doctors =
            this.doctors.filter(

              (
                item: Doctor
              ) =>
                item.id !== temporaryId

            );


          this.fixCurrentPage();


          // ---------------------------------------------
          // FINISH SAVING
          // ---------------------------------------------

          this.saving =
            false;


          // ---------------------------------------------
          // ERROR MESSAGE
          // ---------------------------------------------

          if (
            error.status === 401
          ) {

            this.showMessage(
              'Please login again.',
              'error'
            );

          }

          else if (
            error.status === 403
          ) {

            this.showMessage(
              'Only admin can create doctors.',
              'error'
            );

          }

          else if (
            error.status === 400
          ) {

            this.showMessage(
              'Invalid doctor information.',
              'error'
            );

          }

          else {

            this.showMessage(
              'Unable to create doctor.',
              'error'
            );

          }

        }

      });

  }


  // =====================================================
  // UPDATE DOCTOR
  // =====================================================

  private updateDoctor(
    doctor: Doctor
  ): void {

    if (
      this.editingId === null
    ) {

      return;

    }


    if (
      this.saving
    ) {

      return;

    }


    this.saving =
      true;


    const id =
      this.editingId;


    this.doctorService
      .updateDoctor(
        id,
        doctor
      )
      .subscribe({

        next: (
          updatedDoctor: Doctor
        ) => {

          /*
           * Update only this doctor locally.
           *
           * No GET request.
           */
          this.doctors =
            this.doctors.map(

              (
                item: Doctor
              ) =>

                item.id === id

                  ? updatedDoctor

                  : item

            );


          // ---------------------------------------------
          // CLOSE MODAL
          // ---------------------------------------------

          this.showDoctorModal =
            false;


          // ---------------------------------------------
          // RESET FORM
          // ---------------------------------------------

          this.resetForm();


          // ---------------------------------------------
          // FINISH SAVING
          // ---------------------------------------------

          this.saving =
            false;


          this.fixCurrentPage();


          this.showMessage(
            'Doctor updated successfully.',
            'success'
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error updating doctor:',
            error
          );


          this.saving =
            false;


          if (
            error.status === 401
          ) {

            this.showMessage(
              'Please login again.',
              'error'
            );

          }

          else if (
            error.status === 403
          ) {

            this.showMessage(
              'Only admin can update doctors.',
              'error'
            );

          }

          else if (
            error.status === 404
          ) {

            this.showMessage(
              'Doctor not found.',
              'error'
            );

          }

          else if (
            error.status === 400
          ) {

            this.showMessage(
              'Invalid doctor information.',
              'error'
            );

          }

          else {

            this.showMessage(
              'Unable to update doctor.',
              'error'
            );

          }

        }

      });

  }


  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  openDeleteModal(
    doctor: Doctor
  ): void {

    if (
      doctor.id === undefined
    ) {

      return;

    }


    /*
     * No API call.
     *
     * Confirmation opens immediately.
     */
    this.deleteDoctorId =
      doctor.id;


    this.deleteDoctorName =
      doctor.name;


    this.showDeleteModal =
      true;

  }


  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  closeDeleteModal(): void {

    /*
     * Always allow the confirmation modal
     * to close.
     */
    this.showDeleteModal =
      false;


    this.deleteDoctorId =
      undefined;


    this.deleteDoctorName =
      '';

  }


  // =====================================================
  // CONFIRM DELETE - OPTIMISTIC UI
  // =====================================================

  confirmDeleteDoctor(): void {

    if (
      this.deleting
    ) {

      return;

    }


    if (
      this.deleteDoctorId === undefined
    ) {

      return;

    }


    const id =
      this.deleteDoctorId;


    // ===================================================
    // FIND DOCTOR
    // ===================================================

    const doctorToDelete =
      this.doctors.find(
        (
          doctor: Doctor
        ) =>
          doctor.id === id
      );


    if (
      !doctorToDelete
    ) {

      this.closeDeleteModal();

      return;

    }


    // ===================================================
    // BACKUP
    // ===================================================

    /*
     * Keep a copy in case backend DELETE fails.
     */
    this.deletedDoctorBackup = {

      ...doctorToDelete

    };


    // ===================================================
    // CLOSE MODAL IMMEDIATELY
    // ===================================================

    /*
     * VERY IMPORTANT:
     *
     * Close popup BEFORE HTTP request.
     */
    this.showDeleteModal =
      false;


    this.deleteDoctorId =
      undefined;


    this.deleteDoctorName =
      '';


    // ===================================================
    // REMOVE FROM TABLE IMMEDIATELY
    // ===================================================

    this.doctors =
      this.doctors.filter(
        (
          doctor: Doctor
        ) =>
          doctor.id !== id
      );


    this.fixCurrentPage();


    // ===================================================
    // BACKGROUND DELETE
    // ===================================================

    this.deleting =
      true;


    this.doctorService
      .deleteDoctor(
        id
      )
      .subscribe({

        next: () => {

          /*
           * Backend successfully performed
           * the soft delete.
           */
          this.deleting =
            false;


          this.deletedDoctorBackup =
            undefined;


          this.showMessage(
            'Doctor deleted successfully.',
            'success'
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error deleting doctor:',
            error
          );


          // ---------------------------------------------
          // RESTORE DOCTOR
          // ---------------------------------------------

          if (
            this.deletedDoctorBackup
          ) {

            this.doctors = [

              ...this.doctors,

              this.deletedDoctorBackup

            ];


            this.fixCurrentPage();

          }


          this.deletedDoctorBackup =
            undefined;


          this.deleting =
            false;


          // ---------------------------------------------
          // ERROR MESSAGE
          // ---------------------------------------------

          if (
            error.status === 401
          ) {

            this.showMessage(
              'Please login again.',
              'error'
            );

          }

          else if (
            error.status === 403
          ) {

            this.showMessage(
              'Only admin can delete doctors.',
              'error'
            );

          }

          else if (
            error.status === 404
          ) {

            this.showMessage(
              'Doctor not found.',
              'error'
            );

          }

          else {

            this.showMessage(
              'Unable to delete doctor. Doctor restored.',
              'error'
            );

          }

        }

      });

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.doctor = {

      name: '',

      specialization: '',

      phone: '',

      email: '',

      experience: 0

    };


    this.editingId =
      null;

  }


  // =====================================================
  // REFRESH DOCTORS
  // =====================================================

  refreshDoctors(): void {

    /*
     * Manual refresh only.
     *
     * No full-page loading indicator.
     */
    this.loadDoctors();

  }


  // =====================================================
  // MESSAGE
  // =====================================================

  private showMessage(

    message: string,

    type:
      'success' | 'error' = 'success'

  ): void {

    this.message =
      message;


    this.messageType =
      type;


    setTimeout(() => {

      this.message =
        '';

    }, 3000);

  }

}