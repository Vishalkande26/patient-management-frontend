import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PatientService } from '../../../services/patient.service';
import { Modal } from '../../../shared/modal/modal';

interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  disease: string;
  address: string;
}

type SortColumn =
  | 'id'
  | 'name'
  | 'age'
  | 'gender'
  | 'phone'
  | 'disease'
  | 'address';

type SortDirection = 'asc' | 'desc';

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

  private patientService = inject(PatientService);
  private router = inject(Router);

  // =========================================================
  // PATIENT DATA
  // =========================================================

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  paginatedPatients: Patient[] = [];

  // =========================================================
  // PATIENT FORM
  // =========================================================

  patient: Patient = this.createEmptyPatient();

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
  // SEARCH
  // =========================================================

  searchTerm = '';

  // =========================================================
  // GENDER FILTER
  // =========================================================

  genderFilter = 'ALL';
  genders: string[] = [];

  // =========================================================
  // COLUMN FILTERS
  // =========================================================

  columnIdFilter = '';
  columnNameFilter = '';
  columnAgeFilter = '';
  columnGenderFilter = 'ALL';
  columnPhoneFilter = '';
  columnDiseaseFilter = '';
  columnAddressFilter = '';

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

  showPatientModal = false;
  showDeleteModal = false;

  deletePatientName = '';

  selectedPatient: Patient | null = null;

  // =========================================================
  // MESSAGE
  // =========================================================

  message = '';
  messageType: 'success' | 'error' | '' = '';

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadPatients();
  }

  // =========================================================
  // EMPTY PATIENT
  // =========================================================

  private createEmptyPatient(): Patient {
    return {
      name: '',
      age: 0,
      gender: '',
      phone: '',
      disease: '',
      address: ''
    };
  }

  // =========================================================
  // LOAD PATIENTS
  // =========================================================

  loadPatients(): void {

    this.loading = true;

    this.patientService.getPatients().subscribe({

      next: (data: Patient[]) => {

        this.patients = data ?? [];

        this.buildGenders();

        this.currentPage = 1;

        this.applyFilters();

        this.loading = false;
      },

      error: (error: unknown) => {

        console.error(
          'Error loading patients:',
          error
        );

        this.loading = false;

        this.showMessage(
          'Unable to load patients.',
          'error'
        );
      }

    });
  }

  // =========================================================
  // REFRESH
  // =========================================================

  refreshPatients(): void {
    this.loadPatients();
  }

  // =========================================================
  // BACK TO DASHBOARD
  // =========================================================

  backToDashboard(): void {
    this.router.navigate(['/admin']);
  }

  // =========================================================
  // BUILD GENDERS
  // =========================================================

  private buildGenders(): void {

    const values = this.patients
      .map(patient => patient.gender?.trim())
      .filter(
        (value): value is string =>
          !!value
      );

    this.genders = Array.from(
      new Set(values)
    ).sort();
  }

  // =========================================================
  // SEARCH CHANGE
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
  // CLEAR FILTERS
  // =========================================================

  clearColumnFilters(): void {

    this.columnIdFilter = '';
    this.columnNameFilter = '';
    this.columnAgeFilter = '';
    this.columnGenderFilter = 'ALL';
    this.columnPhoneFilter = '';
    this.columnDiseaseFilter = '';
    this.columnAddressFilter = '';

    this.genderFilter = 'ALL';

    this.currentPage = 1;

    this.applyFilters();
  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.currentPage = 1;

    this.applyFilters();
  }

  // =========================================================
  // APPLY FILTERS
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

    const ageFilter =
      this.columnAgeFilter
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

    this.filteredPatients = this.patients.filter(
      patient => {

        const patientId =
          String(patient.id ?? '').toLowerCase();

        const patientName =
          String(patient.name ?? '').toLowerCase();

        const patientAge =
          String(patient.age ?? '').toLowerCase();

        const patientGender =
          String(patient.gender ?? '').toLowerCase();

        const patientPhone =
          String(patient.phone ?? '').toLowerCase();

        const patientDisease =
          String(patient.disease ?? '').toLowerCase();

        const patientAddress =
          String(patient.address ?? '').toLowerCase();

        // Global search

        const matchesSearch =
          !search ||
          patientId.includes(search) ||
          patientName.includes(search) ||
          patientAge.includes(search) ||
          patientGender.includes(search) ||
          patientPhone.includes(search) ||
          patientDisease.includes(search) ||
          patientAddress.includes(search);

        // ID

        const matchesId =
          !idFilter ||
          patientId.includes(idFilter);

        // Name

        const matchesName =
          !nameFilter ||
          patientName.includes(nameFilter);

        // Age

        const matchesAge =
          !ageFilter ||
          patientAge.includes(ageFilter);

        // Gender

        const matchesGender =
          this.genderFilter === 'ALL' ||
          patient.gender === this.genderFilter;

        // Column gender

        const matchesColumnGender =
          this.columnGenderFilter === 'ALL' ||
          patient.gender === this.columnGenderFilter;

        // Phone

        const matchesPhone =
          !phoneFilter ||
          patientPhone.includes(phoneFilter);

        // Disease

        const matchesDisease =
          !diseaseFilter ||
          patientDisease.includes(diseaseFilter);

        // Address

        const matchesAddress =
          !addressFilter ||
          patientAddress.includes(addressFilter);

        return (
          matchesSearch &&
          matchesId &&
          matchesName &&
          matchesAge &&
          matchesGender &&
          matchesColumnGender &&
          matchesPhone &&
          matchesDisease &&
          matchesAddress
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
  // SORT DATA
  // =========================================================

  private applySorting(): void {

    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;

    this.filteredPatients.sort(
      (a, b) => {

        if (
          this.sortColumn === 'id' ||
          this.sortColumn === 'age'
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
  // EDIT PATIENT
  // =========================================================

  editPatient(patient: Patient): void {

    this.editingId =
      patient.id ?? null;

    this.selectedPatient = patient;

    this.patient = {
      id: patient.id,
      name: patient.name ?? '',
      age: Number(patient.age ?? 0),
      gender: patient.gender ?? '',
      phone: patient.phone ?? '',
      disease: patient.disease ?? '',
      address: patient.address ?? ''
    };

    this.showPatientModal = true;
  }

  // =========================================================
  // ADD PATIENT MODAL
  // =========================================================

  openAddPatientModal(): void {

    this.editingId = null;

    this.selectedPatient = null;

    this.patient =
      this.createEmptyPatient();

    this.showPatientModal = true;
  }

  // =========================================================
  // CLOSE PATIENT MODAL
  // =========================================================

  closePatientModal(): void {

    if (this.saving) {
      return;
    }

    this.showPatientModal = false;

    this.editingId = null;

    this.selectedPatient = null;

    this.patient =
      this.createEmptyPatient();
  }

  // =========================================================
  // SUBMIT PATIENT
  // =========================================================

  submitPatient(): void {

    if (!this.isPatientValid()) {

      this.showMessage(
        'Please fill all required fields.',
        'error'
      );

      return;
    }

    this.saving = true;

    const patientPayload: Patient = {

      name:
        this.patient.name.trim(),

      age:
        Number(this.patient.age),

      gender:
        this.patient.gender.trim(),

      phone:
        this.patient.phone.trim(),

      disease:
        (this.patient.disease ?? '').trim(),

      address:
        (this.patient.address ?? '').trim()
    };

    // =======================================================
    // CREATE
    // =======================================================

    if (this.editingId === null) {

      this.patientService
        .createPatient(patientPayload)
        .subscribe({

          next: (createdPatient: Patient) => {

            this.patients = [
              ...this.patients,
              createdPatient
            ];

            this.buildGenders();

            this.applyFilters();

            this.saving = false;

            this.closePatientModal();

            this.showMessage(
              'Patient added successfully.',
              'success'
            );
          },

          error: (error: unknown) => {

            console.error(
              'Error creating patient:',
              error
            );

            this.saving = false;

            this.showMessage(
              'Unable to add patient.',
              'error'
            );
          }

        });

      return;
    }

    // =======================================================
    // UPDATE
    // =======================================================

    const patientId =
      this.editingId;

    this.patientService
      .updatePatient(
        patientId,
        patientPayload
      )
      .subscribe({

        next: (updatedPatient: Patient) => {

          const index =
            this.patients.findIndex(
              existingPatient =>
                existingPatient.id ===
                updatedPatient.id
            );

          if (index !== -1) {

            this.patients[index] =
              updatedPatient;
          }

          this.buildGenders();

          this.applyFilters();

          this.saving = false;

          this.closePatientModal();

          this.showMessage(
            'Patient updated successfully.',
            'success'
          );
        },

        error: (error: unknown) => {

          console.error(
            'Error updating patient:',
            error
          );

          this.saving = false;

          this.showMessage(
            'Unable to update patient.',
            'error'
          );
        }

      });
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  private isPatientValid(): boolean {

    return (

      this.patient.name.trim().length > 0 &&

      Number(this.patient.age) > 0 &&

      this.patient.gender.trim().length > 0 &&

      this.patient.phone.trim().length > 0

    );
  }

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  openDeleteModal(patient: Patient): void {

    this.selectedPatient = patient;

    this.deletePatientName =
      patient.name;

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

    this.selectedPatient = null;

    this.deletePatientName = '';
  }

  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  confirmDeletePatient(): void {

    if (
      !this.selectedPatient ||
      this.selectedPatient.id === undefined
    ) {
      return;
    }

    this.deleting = true;

    const patientId =
      this.selectedPatient.id;

    this.patientService
      .deletePatient(patientId)
      .subscribe({

        next: () => {

          this.patients =
            this.patients.filter(
              patient =>
                patient.id !== patientId
            );

          this.buildGenders();

          this.applyFilters();

          this.deleting = false;

          this.showDeleteModal = false;

          this.selectedPatient = null;

          this.deletePatientName = '';

          this.showMessage(
            'Patient deleted successfully.',
            'success'
          );
        },

        error: (error: unknown) => {

          console.error(
            'Error deleting patient:',
            error
          );

          this.deleting = false;

          this.showMessage(
            'Unable to delete patient.',
            'error'
          );
        }

      });
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  updatePagination(): void {

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

    this.paginatedPatients =
      this.filteredPatients.slice(
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
        this.filteredPatients.length /
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
      this.filteredPatients.length === 0
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
      this.filteredPatients.length
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