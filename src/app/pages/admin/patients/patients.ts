import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Patient,
  PatientService
} from '../../../services/patient.service';

@Component({
  selector: 'app-patients',
  imports: [FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients {

  private patientService = inject(PatientService);
  private router = inject(Router);

  patient: Patient = {
    name: '',
    age: 1,
    gender: '',
    phone: '',
    disease: '',
    address: ''
  };

  editingId: number | null = null;

  loading = false;

  message = '';

  messageType: 'success' | 'error' = 'success';

  patients: Patient[] = [];

  searchTerm = '';

  genderFilter = 'ALL';

  sortField:
    | 'id'
    | 'name'
    | 'age'
    | 'gender' = 'id';

  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;

  pageSize = 5;

  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {

    this.loading = true;

    this.patientService.getPatients().subscribe({

      next: (data: Patient[]) => {

        this.patients = data;

        this.loading = false;

        this.fixCurrentPage();
      },

      error: (error: unknown) => {

        console.error('Error loading patients:', error);

        this.loading = false;

        this.showMessage(
          'Unable to load patients.',
          'error'
        );
      }
    });
  }

  get genders(): string[] {

    return [
      ...new Set(
        this.patients
          .map(patient => patient.gender)
          .filter(value => value)
      )
    ].sort();
  }

  get filteredPatients(): Patient[] {

    const term =
      this.searchTerm.trim().toLowerCase();

    const filtered =
      this.patients.filter(patient => {

        const matchesSearch =
          !term ||
          patient.name.toLowerCase().includes(term) ||
          patient.phone.includes(term) ||
          patient.disease.toLowerCase().includes(term) ||
          patient.address.toLowerCase().includes(term);

        const matchesGender =
          this.genderFilter === 'ALL' ||
          patient.gender === this.genderFilter;

        return matchesSearch && matchesGender;
      });

    return [...filtered].sort((a, b) => {

      let av: string | number;
      let bv: string | number;

      if (this.sortField === 'id') {

        av = a.id ?? 0;
        bv = b.id ?? 0;

      } else if (this.sortField === 'age') {

        av = a.age;
        bv = b.age;

      } else if (this.sortField === 'name') {

        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();

      } else {

        av = a.gender.toLowerCase();
        bv = b.gender.toLowerCase();
      }

      const result =
        av < bv
          ? -1
          : av > bv
            ? 1
            : 0;

      return this.sortDirection === 'asc'
        ? result
        : -result;
    });
  }

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredPatients.length /
        this.pageSize
      )
    );
  }

  get paginatedPatients(): Patient[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;

    return this.filteredPatients.slice(
      start,
      end
    );
  }

  get startRecord(): number {

    if (this.filteredPatients.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }

  get endRecord(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredPatients.length
    );
  }

  get pageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
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

    this.currentPage = 1;
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

  onSearchChange(): void {

    this.currentPage = 1;
  }

  onFilterChange(): void {

    this.currentPage = 1;
  }

  sortBy(
    field:
      | 'id'
      | 'name'
      | 'age'
      | 'gender'
  ): void {

    if (this.sortField === field) {

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

  getSortIcon(
    field:
      | 'id'
      | 'name'
      | 'age'
      | 'gender'
  ): string {

    if (this.sortField !== field) {
      return '↕';
    }

    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';
  }

  submitPatient(): void {

    if (
      !this.patient.name ||
      !this.patient.gender ||
      !this.patient.phone ||
      !this.patient.disease ||
      !this.patient.address
    ) {

      this.showMessage(
        'Please fill all required fields.',
        'error'
      );

      return;
    }

    if (this.editingId !== null) {

      this.updatePatient();

    } else {

      this.createPatient();
    }
  }

  private createPatient(): void {

    this.loading = true;

    this.patientService
      .createPatient(this.patient)
      .subscribe({

        next: (createdPatient: Patient) => {

          this.patients = [
            ...this.patients,
            createdPatient
          ];

          this.loading = false;

          this.showMessage(
            'Patient created successfully.'
          );

          this.resetForm();

          this.currentPage =
            this.totalPages;
        },

        error: (error: unknown) => {

          console.error(
            'Error creating patient:',
            error
          );

          this.loading = false;

          this.showMessage(
            'Unable to create patient.',
            'error'
          );
        }
      });
  }

  editPatient(patient: Patient): void {

    this.editingId =
      patient.id ?? null;

    this.patient = {

      name: patient.name,

      age: patient.age,

      gender: patient.gender,

      phone: patient.phone,

      disease: patient.disease,

      address: patient.address
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private updatePatient(): void {

    if (this.editingId === null) {
      return;
    }

    this.loading = true;

    this.patientService
      .updatePatient(
        this.editingId,
        this.patient
      )
      .subscribe({

        next: (updatedPatient: Patient) => {

          this.patients =
            this.patients.map(patient =>
              patient.id === this.editingId
                ? updatedPatient
                : patient
            );

          this.loading = false;

          this.showMessage(
            'Patient updated successfully.'
          );

          this.resetForm();
        },

        error: (error: unknown) => {

          console.error(
            'Error updating patient:',
            error
          );

          this.loading = false;

          this.showMessage(
            'Unable to update patient.',
            'error'
          );
        }
      });
  }

  deletePatient(
    id: number | undefined
  ): void {

    if (id === undefined) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this patient?'
      );

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.patientService
      .deletePatient(id)
      .subscribe({

        next: () => {

          this.patients =
            this.patients.filter(
              patient =>
                patient.id !== id
            );

          this.loading = false;

          this.fixCurrentPage();

          this.showMessage(
            'Patient deleted successfully.'
          );
        },

        error: (error: unknown) => {

          console.error(
            'Error deleting patient:',
            error
          );

          this.loading = false;

          this.showMessage(
            'Unable to delete patient.',
            'error'
          );
        }
      });
  }

  resetForm(): void {

    this.patient = {

      name: '',

      age: 1,

      gender: '',

      phone: '',

      disease: '',

      address: ''
    };

    this.editingId = null;
  }

  refreshPatients(): void {

    this.loadPatients();
  }

  backToDashboard(): void {

    this.router.navigate(['/admin']);
  }

  private showMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {

    this.message = message;

    this.messageType = type;

    setTimeout(() => {

      this.message = '';

    }, 3000);
  }
}