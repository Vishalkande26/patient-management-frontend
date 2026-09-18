import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
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
    ReactiveFormsModule,
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
  // FIX FOR MATH IN ANGULAR TEMPLATE
  // ============================================================

  /*
   * Angular templates cannot directly access
   * the global Math object unless it is exposed
   * through the component.
   *
   * This keeps the existing HTML Math.min(...)
   * functionality unchanged.
   */

  readonly Math = Math;


  // ============================================================
  // PATIENT REACTIVE FORM
  // ============================================================

  /*
   * Reactive Form is used ONLY for the
   * Add/Edit Patient modal.
   *
   * Search, filter and pagination controls
   * continue using ngModel.
   */

  patientForm =
    new FormGroup({

      name: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      ),

      age: new FormControl(
        0,
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.max(150)
          ]
        }
      ),

      gender: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      ),

      phone: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern(
              /^[0-9]{10}$/
            )
          ]
        }
      ),

      /*
       * These validators keep the same
       * validation behavior already present
       * in your submitPatient() method.
       *
       * UI labels/placeholders are NOT changed.
       */

      disease: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      ),

      address: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required
          ]
        }
      )

    });


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
  // RESET REACTIVE FORM
  // ============================================================

  private resetPatientForm(): void {

    this.patientForm.reset({

      name: '',

      age: 0,

      gender: '',

      phone: '',

      disease: '',

      address: ''

    });

    this.patientForm.markAsPristine();

    this.patientForm.markAsUntouched();
  }


  // ============================================================
  // PATCH REACTIVE FORM FOR EDIT
  // ============================================================

  private patchPatientForm(
    patient: Patient
  ): void {

    this.patientForm.patchValue({

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
        patient.address

    });

    this.patientForm.markAsPristine();

    this.patientForm.markAsUntouched();
  }


  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  loadPatients(): void {

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

        if (
          patient.deleted === true
        ) {

          return false;
        }


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


        const matchesGender =
          this.genderFilter === 'ALL' ||
          patient.gender ===
            this.genderFilter;


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


    this.currentPage = 1;

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

    this.patient =
      this.createEmptyPatient();

    this.editingId = null;

    this.message = '';

    /*
     * Reset Reactive Form for ADD.
     */

    this.resetPatientForm();

    this.showPatientModal =
      true;
  }


  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  editPatient(
    patient: Patient
  ): void {

    if (
      patient.id === undefined ||
      patient.isSaving
    ) {

      return;
    }


    this.editingId =
      patient.id;


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


    /*
     * Patch existing patient
     * into Reactive Form.
     */

    this.patchPatientForm(
      this.patient
    );


    this.message = '';

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


    /*
     * Reset Reactive Form when
     * modal is closed.
     */

    this.resetPatientForm();
  }


  // ============================================================
  // SUBMIT PATIENT
  // ============================================================

  submitPatient(): void {

    if (this.saving) {

      return;
    }


    // ----------------------------------------------------------
    // REACTIVE FORM VALIDATION
    // ----------------------------------------------------------

    if (
      this.patientForm.invalid
    ) {

      this.patientForm.markAllAsTouched();

      /*
       * Keep the same validation messages
       * already used by the original form.
       */

      const errorMessage =
        this.getPatientFormErrorMessage();

      this.showError(
        errorMessage
      );

      return;
    }


    // ----------------------------------------------------------
    // GET VALUES FROM REACTIVE FORM
    // ----------------------------------------------------------

    const formValue =
      this.patientForm.getRawValue();


    /*
     * Copy Reactive Form values into
     * the existing patient object.
     *
     * CRUD continues using the same
     * patient object and methods.
     */

    this.patient = {

      ...this.patient,

      name:
        formValue.name.trim(),

      age:
        Number(formValue.age),

      gender:
        formValue.gender.trim(),

      phone:
        formValue.phone.trim(),

      disease:
        formValue.disease.trim(),

      address:
        formValue.address.trim()
    };


    // ----------------------------------------------------------
    // EXISTING VALIDATION
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


    // ----------------------------------------------------------
    // ADD
    // ----------------------------------------------------------

    if (
      this.editingId === null
    ) {

      this.createPatientOptimistically();

      return;
    }


    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    this.updatePatientOptimistically();
  }


  // ============================================================
  // REACTIVE FORM ERROR MESSAGE
  // ============================================================

  private getPatientFormErrorMessage(): string {

    const name =
      this.patientForm.controls.name;

    const age =
      this.patientForm.controls.age;

    const gender =
      this.patientForm.controls.gender;

    const phone =
      this.patientForm.controls.phone;

    const disease =
      this.patientForm.controls.disease;

    const address =
      this.patientForm.controls.address;


    if (
      name.hasError('required')
    ) {

      return 'Patient name is required.';
    }


    if (
      age.hasError('required') ||
      age.hasError('min')
    ) {

      return 'Age must be greater than 0.';
    }


    if (
      age.hasError('max')
    ) {

      return 'Age cannot be greater than 150.';
    }


    if (
      gender.hasError('required')
    ) {

      return 'Gender is required.';
    }


    if (
      phone.hasError('required')
    ) {

      return 'Phone number is required.';
    }


    if (
      phone.hasError('pattern')
    ) {

      return 'Phone number must be exactly 10 digits.';
    }


    if (
      disease.hasError('required')
    ) {

      return 'Disease is required.';
    }


    if (
      address.hasError('required')
    ) {

      return 'Address is required.';
    }


    return 'Please enter valid patient information.';
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


    this.patients = [
      ...this.patients,
      temporaryPatient
    ];


    this.currentPage =
      this.totalPages;


    this.closePatientModal();


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


    this.patientService
      .createPatient(
        requestPatient
      )
      .subscribe({

        next: (
          createdPatient: Patient
        ) => {

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


    this.patients =
      this.patients.map(
        (item: Patient) =>
          item.id === id
            ? updatedPatient
            : item
      );


    this.closePatientModal();


    this.saving = true;


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


    this.patientService
      .updatePatient(
        id,
        requestPatient
      )
      .subscribe({

        next: (
          responsePatient: Patient
        ) => {

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


    this.deletePatientId =
      patient.id;


    this.deletePatientName =
      patient.name;


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


    const patientToDelete =
      this.patients.find(
        (item: Patient) =>
          item.id === id
      );


    if (!patientToDelete) {

      this.closeDeleteModal();

      return;
    }


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


    this.closeDeleteModal();


    this.patients =
      this.patients.filter(
        (item: Patient) =>
          item.id !== id
      );


    this.patientService
      .setCachedPatients(
        this.patients
      );


    this.fixCurrentPage();


    this.deleting = true;


    this.patientService
      .deletePatient(id)
      .subscribe({

        next: () => {

          this.deletedPatientBackup =
            undefined;


          this.deleting = false;


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

    this.resetPatientForm();
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