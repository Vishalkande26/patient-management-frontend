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
  Patient,
  PatientService
} from '../../../services/patient.service';

import {
  Modal
} from '../../../shared/modal/modal';


@Component({
  selector: 'app-patients',

  imports: [
    FormsModule,
    Modal
  ],

  templateUrl: './patients.html',

  styleUrl: './patients.css'
})
export class Patients implements OnInit {


  // ============================================================
  // SERVICES
  // ============================================================

  private patientService =
    inject(PatientService);

  private router =
    inject(Router);


  // ============================================================
  // PATIENT LIST
  // ============================================================

  patients: Patient[] = [];


  // ============================================================
  // CURRENT PATIENT FORM
  // ============================================================

  patient: Patient =
    this.createEmptyPatient();


  // ============================================================
  // LOADING
  // ============================================================

  /*
   * Used only while loading the
   * initial patient list.
   *
   * CRUD operations do not call
   * loadPatients().
   */

  loading = false;


  // ============================================================
  // CRUD STATES
  // ============================================================

  saving = false;

  deleting = false;


  // ============================================================
  // EDITING
  // ============================================================

  editingId: number | null = null;


  // ============================================================
  // PATIENT MODAL
  // ============================================================

  showPatientModal = false;


  // ============================================================
  // DELETE MODAL
  // ============================================================

  showDeleteModal = false;

  deletePatientId:
    number | undefined;

  deletePatientName = '';


  // ============================================================
  // DELETE BACKUP
  // ============================================================

  private deletedPatientBackup:
    Patient | undefined;


  // ============================================================
  // CREATE BACKUP
  // ============================================================

  private temporaryPatient:
    Patient | undefined;


  // ============================================================
  // UPDATE BACKUP
  // ============================================================

  private updatingPatientBackup:
    Patient | undefined;


  // ============================================================
  // SEARCH
  // ============================================================

  searchTerm = '';


  // ============================================================
  // FILTER
  // ============================================================

  genderFilter = 'ALL';


  // ============================================================
  // COLUMN FILTERS
  // ============================================================

  columnIdFilter = '';

  columnNameFilter = '';

  columnAgeFilter = '';

  columnGenderFilter = '';

  columnPhoneFilter = '';

  columnDiseaseFilter = '';

  columnAddressFilter = '';


  // ============================================================
  // SORT
  // ============================================================

  sortField:
    | 'id'
    | 'name'
    | 'age'
    | 'gender'
    | 'phone'
    | 'disease'
    | 'address'
    = 'id';

  sortDirection:
    | 'asc'
    | 'desc'
    = 'asc';


  // ============================================================
  // PAGINATION
  // ============================================================

  currentPage = 1;

  pageSize = 5;


  // ============================================================
  // MESSAGE
  // ============================================================

  /*
   * Existing patients.html uses
   * message and messageType.
   */

  message = '';

  messageType:
    | 'success'
    | 'error'
    = 'success';


  // ============================================================
  // POPUP SUPPORT
  // ============================================================

  showPopup = false;

  popupMessage = '';

  popupType:
    | 'success'
    | 'error'
    = 'success';


  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {

    /*
     * Load cached data first.
     */

    const cachedPatients =
      this.patientService
        .getCachedPatients();

    this.patients =
      cachedPatients;


    /*
     * Show loading only when
     * there is no cached data.
     */

    this.loading =
      this.patients.length === 0;


    /*
     * Get latest data in background.
     */

    this.loadPatients();
  }


  // ============================================================
  // EMPTY PATIENT
  // ============================================================

  private createEmptyPatient(): Patient {

    return {

      name: '',

      age: 0,

      gender: '',

      phone: '',

      disease: '',

      address: '',

      isSaving: false,

      deleted: false
    };
  }


  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  loadPatients(): void {

    /*
     * Only show loading when
     * there is no current data.
     */

    if (
      this.patients.length === 0
    ) {

      this.loading = true;
    }


    this.patientService
      .getPatients()
      .subscribe({

        next: (
          data: Patient[]
        ) => {

          /*
           * Do not overwrite an
           * optimistic CRUD operation.
           */

          if (
            this.saving ||
            this.deleting
          ) {

            this.loading = false;

            return;
          }


          this.patients =
            data.map(
              (item: Patient) => ({
                ...item,
                isSaving: false
              })
            );


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.loading = false;


          this.fixCurrentPage();
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading patients:',
            error
          );


          this.loading = false;


          /*
           * If cached data exists,
           * keep showing it.
           */

          if (
            this.patients.length > 0
          ) {

            return;
          }


          this.showError(
            'Failed to load patients.'
          );
        }

      });
  }


  // ============================================================
  // REFRESH PATIENTS
  // ============================================================

  refreshPatients(): void {

    this.loadPatients();
  }


  // ============================================================
  // SEARCH CHANGE
  // ============================================================

  onSearchChange(): void {

    this.currentPage = 1;
  }


  // ============================================================
  // FILTER CHANGE
  // ============================================================

  onFilterChange(): void {

    this.currentPage = 1;
  }


  // ============================================================
  // GENDER OPTIONS
  // ============================================================

  get genders(): string[] {

    return [
      ...new Set(
        this.patients
          .map(
            (patient: Patient) =>
              patient.gender
          )
          .filter(
            (gender: string) =>
              gender.trim() !== ''
          )
      )
    ].sort();
  }


  // ============================================================
  // FILTERED PATIENTS
  // ============================================================

  get filteredPatients(): Patient[] {

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


    const ageFilter =
      this.columnAgeFilter
        .trim()
        .toLowerCase();


    const genderColumnFilter =
      this.columnGenderFilter
        .trim()
        .toLowerCase();


    const phoneFilter =
      this.columnPhoneFilter
        .trim()
        .toLowerCase();


    const diseaseFilter =
      this.columnDiseaseFilter
        .trim()
        .toLowerCase();


    const addressFilter =
      this.columnAddressFilter
        .trim()
        .toLowerCase();


    return this.patients.filter(
      (patient: Patient) => {

        /*
         * Hide soft-deleted patients.
         */

        if (
          patient.deleted === true
        ) {

          return false;
        }


        /*
         * Global search.
         */

        const matchesSearch =
          !search ||

          String(
            patient.id ?? ''
          )
            .toLowerCase()
            .includes(search) ||

          patient.name
            .toLowerCase()
            .includes(search) ||

          String(
            patient.age
          )
            .toLowerCase()
            .includes(search) ||

          patient.gender
            .toLowerCase()
            .includes(search) ||

          patient.phone
            .toLowerCase()
            .includes(search) ||

          patient.disease
            .toLowerCase()
            .includes(search) ||

          patient.address
            .toLowerCase()
            .includes(search);


        /*
         * Gender dropdown.
         */

        const matchesGender =
          this.genderFilter === 'ALL' ||
          patient.gender ===
            this.genderFilter;


        /*
         * Column filters.
         */

        const matchesId =
          !idFilter ||
          String(
            patient.id ?? ''
          )
            .toLowerCase()
            .includes(idFilter);


        const matchesName =
          !nameFilter ||
          patient.name
            .toLowerCase()
            .includes(nameFilter);


        const matchesAge =
          !ageFilter ||
          String(
            patient.age
          )
            .toLowerCase()
            .includes(ageFilter);


        const matchesGenderColumn =
          !genderColumnFilter ||
          patient.gender
            .toLowerCase()
            .includes(
              genderColumnFilter
            );


        const matchesPhone =
          !phoneFilter ||
          patient.phone
            .toLowerCase()
            .includes(phoneFilter);


        const matchesDisease =
          !diseaseFilter ||
          patient.disease
            .toLowerCase()
            .includes(diseaseFilter);


        const matchesAddress =
          !addressFilter ||
          patient.address
            .toLowerCase()
            .includes(addressFilter);


        return (
          matchesSearch &&
          matchesGender &&
          matchesId &&
          matchesName &&
          matchesAge &&
          matchesGenderColumn &&
          matchesPhone &&
          matchesDisease &&
          matchesAddress
        );
      }
    );
  }


  // ============================================================
  // SORTED PATIENTS
  // ============================================================

  get sortedPatients(): Patient[] {

    const result = [
      ...this.filteredPatients
    ];


    result.sort(
      (
        a: Patient,
        b: Patient
      ) => {

        let valueA:
          string | number = '';

        let valueB:
          string | number = '';


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


          case 'age':

            valueA =
              a.age;

            valueB =
              b.age;

            break;


          case 'gender':

            valueA =
              a.gender.toLowerCase();

            valueB =
              b.gender.toLowerCase();

            break;


          case 'phone':

            valueA =
              a.phone.toLowerCase();

            valueB =
              b.phone.toLowerCase();

            break;


          case 'disease':

            valueA =
              a.disease.toLowerCase();

            valueB =
              b.disease.toLowerCase();

            break;


          case 'address':

            valueA =
              a.address.toLowerCase();

            valueB =
              b.address.toLowerCase();

            break;
        }


        if (
          valueA < valueB
        ) {

          return this.sortDirection === 'asc'
            ? -1
            : 1;
        }


        if (
          valueA > valueB
        ) {

          return this.sortDirection === 'asc'
            ? 1
            : -1;
        }


        return 0;
      }
    );


    return result;
  }


  // ============================================================
  // PAGINATION
  // ============================================================

  get paginatedPatients(): Patient[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;


    const end =
      start + this.pageSize;


    return this.sortedPatients.slice(
      start,
      end
    );
  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.sortedPatients.length /
        this.pageSize
      )
    );
  }


  get pageNumbers(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) =>
        index + 1
    );
  }


  get startRecord(): number {

    if (
      this.sortedPatients.length === 0
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

      this.sortedPatients.length
    );
  }


  // ============================================================
  // PAGE SIZE CHANGE
  // ============================================================

  onPageSizeChange(
    event?: Event
  ): void {

    /*
     * Supports HTML such as:
     *
     * (change)="onPageSizeChange($event)"
     *
     * and also:
     *
     * (change)="onPageSizeChange()"
     */

    if (event) {

      const target =
        event.target as HTMLSelectElement;

      const newSize =
        Number(target.value);


      if (
        Number.isFinite(newSize) &&
        newSize > 0
      ) {

        this.pageSize =
          newSize;
      }
    }


    /*
     * Always return to the first page
     * after changing page size.
     */

    this.currentPage = 1;


    /*
     * Make sure the page is valid.
     */

    this.fixCurrentPage();
  }


  // ============================================================
  // SORT
  // ============================================================

  sortBy(
    field:
      | 'id'
      | 'name'
      | 'age'
      | 'gender'
      | 'phone'
      | 'disease'
      | 'address'
  ): void {

    if (
      this.sortField === field
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortField = field;

      this.sortDirection = 'asc';
    }


    this.currentPage = 1;
  }


  // ============================================================
  // SORT ICON
  // ============================================================

  getSortIcon(
    field:
      | 'id'
      | 'name'
      | 'age'
      | 'gender'
      | 'phone'
      | 'disease'
      | 'address'
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


  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.currentPage = 1;
  }


  // ============================================================
  // COLUMN FILTER CHANGE
  // ============================================================

  onColumnFilterChange(): void {

    this.currentPage = 1;
  }


  // ============================================================
  // CLEAR COLUMN FILTERS
  // ============================================================

  clearColumnFilters(): void {

    this.columnIdFilter = '';

    this.columnNameFilter = '';

    this.columnAgeFilter = '';

    this.columnGenderFilter = '';

    this.columnPhoneFilter = '';

    this.columnDiseaseFilter = '';

    this.columnAddressFilter = '';

    this.genderFilter = 'ALL';

    this.currentPage = 1;
  }


  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;
    }
  }


  // ============================================================
  // NEXT PAGE
  // ============================================================

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;
    }
  }


  // ============================================================
  // CHANGE PAGE
  // ============================================================

  changePage(
    page: number
  ): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {

      this.currentPage = page;
    }
  }


  // ============================================================
  // FIX CURRENT PAGE
  // ============================================================

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


  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  openAddPatientModal(): void {

    /*
     * No API call.
     * Modal opens immediately.
     */

    this.patient =
      this.createEmptyPatient();


    this.editingId = null;


    this.message = '';


    this.showPatientModal =
      true;
  }


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  editPatient(
    patient: Patient
  ): void {

    /*
     * No GET request.
     * Data already exists in table.
     */

    if (
      patient.id === undefined ||
      patient.isSaving
    ) {

      return;
    }


    this.editingId =
      patient.id;


    /*
     * Copy patient so editing
     * does not immediately modify
     * the table.
     */

    this.patient = {

      id:
        patient.id,

      name:
        patient.name,

      age:
        patient.age,

      gender:
        patient.gender,

      phone:
        patient.phone,

      disease:
        patient.disease,

      address:
        patient.address,

      deleted:
        patient.deleted,

      isSaving: false
    };


    this.message = '';


    /*
     * Open immediately.
     */

    this.showPatientModal =
      true;
  }


  // ============================================================
  // EDIT ALIAS
  // ============================================================

  openEditPatientModal(
    patient: Patient
  ): void {

    this.editPatient(
      patient
    );
  }


  // ============================================================
  // CLOSE PATIENT MODAL
  // ============================================================

  closePatientModal(): void {

    this.showPatientModal =
      false;


    this.editingId = null;


    this.patient =
      this.createEmptyPatient();
  }


  // ============================================================
  // SUBMIT PATIENT
  // ============================================================

  submitPatient(): void {

    if (this.saving) {

      return;
    }


    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !this.patient.name.trim()
    ) {

      this.showError(
        'Patient name is required.'
      );

      return;
    }


    if (
      !this.patient.age ||
      this.patient.age < 1
    ) {

      this.showError(
        'Age must be greater than 0.'
      );

      return;
    }


    if (
      !this.patient.gender.trim()
    ) {

      this.showError(
        'Gender is required.'
      );

      return;
    }


    if (
      !this.patient.phone.trim()
    ) {

      this.showError(
        'Phone number is required.'
      );

      return;
    }


    if (
      !/^[0-9]{10}$/.test(
        this.patient.phone.trim()
      )
    ) {

      this.showError(
        'Phone number must be exactly 10 digits.'
      );

      return;
    }


    if (
      !this.patient.disease.trim()
    ) {

      this.showError(
        'Disease is required.'
      );

      return;
    }


    if (
      !this.patient.address.trim()
    ) {

      this.showError(
        'Address is required.'
      );

      return;
    }


    /*
     * ADD
     */

    if (
      this.editingId === null
    ) {

      this.createPatientOptimistically();

      return;
    }


    /*
     * UPDATE
     */

    this.updatePatientOptimistically();
  }


  // ============================================================
  // SAVE ALIAS
  // ============================================================

  savePatient(): void {

    this.submitPatient();
  }


  // ============================================================
  // OPTIMISTIC ADD
  // ============================================================

  private createPatientOptimistically(): void {

    if (this.saving) {

      return;
    }


    this.saving = true;


    /*
     * Temporary patient intentionally
     * has NO fake ID.
     */

    const temporaryPatient: Patient = {

      name:
        this.patient.name.trim(),

      age:
        Number(this.patient.age),

      gender:
        this.patient.gender.trim(),

      phone:
        this.patient.phone.trim(),

      disease:
        this.patient.disease.trim(),

      address:
        this.patient.address.trim(),

      isSaving: true,

      deleted: false
    };


    this.temporaryPatient =
      temporaryPatient;


    /*
     * Update UI immediately.
     */

    this.patients = [
      ...this.patients,
      temporaryPatient
    ];


    /*
     * Go to last page.
     */

    this.currentPage =
      this.totalPages;


    /*
     * Close modal immediately.
     */

    this.closePatientModal();


    /*
     * Request sent to backend.
     */

    const requestPatient: Patient = {

      name:
        temporaryPatient.name,

      age:
        temporaryPatient.age,

      gender:
        temporaryPatient.gender,

      phone:
        temporaryPatient.phone,

      disease:
        temporaryPatient.disease,

      address:
        temporaryPatient.address
    };


    /*
     * POST runs in background.
     */

    this.patientService
      .createPatient(
        requestPatient
      )
      .subscribe({

        next: (
          createdPatient: Patient
        ) => {

          /*
           * Replace temporary row
           * with real backend row.
           */

          this.patients =
            this.patients.map(
              (item: Patient) => {

                if (
                  item ===
                  temporaryPatient
                ) {

                  return {

                    ...createdPatient,

                    isSaving: false
                  };
                }


                return item;
              }
            );


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.temporaryPatient =
            undefined;


          this.saving = false;


          this.fixCurrentPage();


          this.showSuccess(
            'Patient added successfully!'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Create patient error:',
            error
          );


          /*
           * Remove temporary row.
           */

          this.patients =
            this.patients.filter(
              (item: Patient) =>
                item !==
                temporaryPatient
            );


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.temporaryPatient =
            undefined;


          this.saving = false;


          this.fixCurrentPage();


          this.handleError(
            error,
            'Failed to add patient.'
          );
        }

      });
  }


  // ============================================================
  // OPTIMISTIC UPDATE
  // ============================================================

  private updatePatientOptimistically(): void {

    if (
      this.saving ||
      this.editingId === null
    ) {

      return;
    }


    const id =
      this.editingId;


    /*
     * Find current patient.
     */

    const existingPatient =
      this.patients.find(
        (item: Patient) =>
          item.id === id
      );


    if (!existingPatient) {

      this.showError(
        'Patient not found.'
      );

      return;
    }


    /*
     * Backup old data.
     */

    const oldPatient: Patient = {

      id:
        existingPatient.id,

      name:
        existingPatient.name,

      age:
        existingPatient.age,

      gender:
        existingPatient.gender,

      phone:
        existingPatient.phone,

      disease:
        existingPatient.disease,

      address:
        existingPatient.address,

      deleted:
        existingPatient.deleted,

      isSaving: false
    };


    this.updatingPatientBackup =
      oldPatient;


    /*
     * Create updated object.
     */

    const updatedPatient: Patient = {

      id: id,

      name:
        this.patient.name.trim(),

      age:
        Number(this.patient.age),

      gender:
        this.patient.gender.trim(),

      phone:
        this.patient.phone.trim(),

      disease:
        this.patient.disease.trim(),

      address:
        this.patient.address.trim(),

      deleted:
        existingPatient.deleted,

      isSaving: true
    };


    /*
     * Update UI immediately.
     */

    this.patients =
      this.patients.map(
        (item: Patient) =>
          item.id === id
            ? updatedPatient
            : item
      );


    /*
     * Close modal immediately.
     */

    this.closePatientModal();


    this.saving = true;


    /*
     * Request sent to backend.
     */

    const requestPatient: Patient = {

      name:
        updatedPatient.name,

      age:
        updatedPatient.age,

      gender:
        updatedPatient.gender,

      phone:
        updatedPatient.phone,

      disease:
        updatedPatient.disease,

      address:
        updatedPatient.address
    };


    /*
     * PUT runs in background.
     */

    this.patientService
      .updatePatient(
        id,
        requestPatient
      )
      .subscribe({

        next: (
          responsePatient: Patient
        ) => {

          /*
           * Replace optimistic row
           * with backend response.
           */

          this.patients =
            this.patients.map(
              (item: Patient) => {

                if (
                  item.id === id
                ) {

                  return {

                    ...responsePatient,

                    isSaving: false
                  };
                }


                return item;
              }
            );


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.updatingPatientBackup =
            undefined;


          this.saving = false;


          this.fixCurrentPage();


          this.showSuccess(
            'Patient updated successfully!'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Update patient error:',
            error
          );


          /*
           * Rollback.
           */

          if (
            this.updatingPatientBackup
          ) {

            this.patients =
              this.patients.map(
                (item: Patient) =>
                  item.id === id
                    ? this.updatingPatientBackup!
                    : item
              );
          }


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.updatingPatientBackup =
            undefined;


          this.saving = false;


          this.fixCurrentPage();


          this.handleError(
            error,
            'Failed to update patient.'
          );
        }

      });
  }


  // ============================================================
  // OPEN DELETE MODAL
  // ============================================================

  openDeleteModal(
    patient: Patient
  ): void {

    if (
      patient.id === undefined ||
      patient.isSaving
    ) {

      return;
    }


    /*
     * No API call.
     */

    this.deletePatientId =
      patient.id;


    this.deletePatientName =
      patient.name;


    /*
     * Open immediately.
     */

    this.showDeleteModal =
      true;
  }


  // ============================================================
  // CLOSE DELETE MODAL
  // ============================================================

  closeDeleteModal(): void {

    this.showDeleteModal =
      false;


    this.deletePatientId =
      undefined;


    this.deletePatientName =
      '';
  }


  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  confirmDeletePatient(): void {

    if (this.deleting) {

      return;
    }


    if (
      this.deletePatientId ===
      undefined
    ) {

      return;
    }


    const id =
      this.deletePatientId;


    /*
     * Find patient.
     */

    const patientToDelete =
      this.patients.find(
        (item: Patient) =>
          item.id === id
      );


    if (!patientToDelete) {

      this.closeDeleteModal();

      return;
    }


    /*
     * Backup patient.
     */

    this.deletedPatientBackup = {

      id:
        patientToDelete.id,

      name:
        patientToDelete.name,

      age:
        patientToDelete.age,

      gender:
        patientToDelete.gender,

      phone:
        patientToDelete.phone,

      disease:
        patientToDelete.disease,

      address:
        patientToDelete.address,

      deleted:
        patientToDelete.deleted,

      isSaving: false
    };


    /*
     * Close modal immediately.
     */

    this.closeDeleteModal();


    /*
     * Remove row immediately.
     */

    this.patients =
      this.patients.filter(
        (item: Patient) =>
          item.id !== id
      );


    /*
     * Update cache.
     */

    this.patientService
      .setCachedPatients(
        this.patients
      );


    this.fixCurrentPage();


    /*
     * Background delete.
     */

    this.deleting = true;


    this.patientService
      .deletePatient(id)
      .subscribe({

        next: () => {

          this.deletedPatientBackup =
            undefined;


          this.deleting = false;


          /*
           * No loadPatients().
           */

          this.showSuccess(
            'Patient deleted successfully!'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Delete patient error:',
            error
          );


          /*
           * Rollback.
           */

          if (
            this.deletedPatientBackup
          ) {

            this.patients = [
              ...this.patients,
              this.deletedPatientBackup
            ];
          }


          this.patientService
            .setCachedPatients(
              this.patients
            );


          this.fixCurrentPage();


          this.deletedPatientBackup =
            undefined;


          this.deleting = false;


          this.handleError(
            error,
            'Failed to delete patient.'
          );
        }

      });
  }


  // ============================================================
  // DELETE ALIAS
  // ============================================================

  deletePatient(
    id: number | undefined
  ): void {

    if (
      id === undefined
    ) {

      return;
    }


    const patient =
      this.patients.find(
        (item: Patient) =>
          item.id === id
      );


    if (!patient) {

      return;
    }


    this.openDeleteModal(
      patient
    );
  }


  // ============================================================
  // CLEAR FORM
  // ============================================================

  clearForm(): void {

    this.patient =
      this.createEmptyPatient();

    this.editingId = null;
  }


  // ============================================================
  // SUCCESS MESSAGE
  // ============================================================

  showSuccess(
    text: string
  ): void {

    this.message =
      text;

    this.messageType =
      'success';


    this.popupMessage =
      text;

    this.popupType =
      'success';

    this.showPopup =
      true;


    setTimeout(() => {

      this.message = '';

      this.showPopup =
        false;

    }, 3000);
  }


  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  showError(
    text: string
  ): void {

    this.message =
      text;

    this.messageType =
      'error';


    this.popupMessage =
      text;

    this.popupType =
      'error';

    this.showPopup =
      true;


    setTimeout(() => {

      this.message = '';

      this.showPopup =
        false;

    }, 3000);
  }


  // ============================================================
  // ERROR HANDLER
  // ============================================================

  private handleError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): void {

    if (
      error.status === 400
    ) {

      this.showError(
        error.error?.message ??
          'Invalid patient information.'
      );

      return;
    }


    if (
      error.status === 401
    ) {

      this.showError(
        'Please login again.'
      );

      return;
    }


    if (
      error.status === 403
    ) {

      this.showError(
        'You do not have permission for this action.'
      );

      return;
    }


    if (
      error.status === 404
    ) {

      this.showError(
        'Patient was not found.'
      );

      return;
    }


    if (
      error.status === 409
    ) {

      this.showError(
        error.error?.message ??
          'Patient already exists.'
      );

      return;
    }


    this.showError(
      defaultMessage
    );
  }


  // ============================================================
  // BACK
  // ============================================================

  goBack(): void {

    this.router.navigate([
      '/admin'
    ]);
  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  backToDashboard(): void {

    this.router.navigate([
      '/admin'
    ]);
  }


  // ============================================================
  // LOGOUT
  // ============================================================

  logout(): void {

    this.patientService
      .clearCache();


    localStorage.removeItem(
      'token'
    );


    localStorage.removeItem(
      'username'
    );


    localStorage.removeItem(
      'email'
    );


    localStorage.removeItem(
      'role'
    );


    this.router.navigate([
      '/login'
    ]);
  }

}