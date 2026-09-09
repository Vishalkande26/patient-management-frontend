import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Doctor,
  DoctorService
} from '../../../services/doctor.service';

@Component({
  selector: 'app-doctors',
  imports: [FormsModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors {

  private doctorService = inject(DoctorService);
  private router = inject(Router);


  /* =========================
     FORM
     ========================= */

  doctor: Doctor = {
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experience: 0
  };

  editingId: number | null = null;

  loading = false;

  message = '';

  messageType: 'success' | 'error' = 'success';


  /* =========================
     DOCTORS
     ========================= */

  doctors: Doctor[] = [];


  /* =========================
     SEARCH
     ========================= */

  searchTerm = '';

  specializationFilter = 'ALL';


  /* =========================
     SORT
     ========================= */

  sortField:
    | 'id'
    | 'name'
    | 'specialization'
    | 'experience' = 'id';

  sortDirection: 'asc' | 'desc' = 'asc';


  /* =========================
     PAGINATION
     ========================= */

  currentPage = 1;

  pageSize = 5;


  constructor() {
    this.loadDoctors();
  }


  /* =========================
     BACK TO ADMIN DASHBOARD
     ========================= */

  backToDashboard(): void {

    this.router.navigate(['/admin']);

  }


  /* =========================
     LOAD DOCTORS
     ========================= */

  loadDoctors(): void {

    this.loading = true;

    this.doctorService.getDoctors().subscribe({

      next: (data: Doctor[]) => {

        this.doctors = data;

        this.loading = false;

        this.fixCurrentPage();

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


  /* =========================
     SPECIALIZATION FILTER
     ========================= */

  get specializations(): string[] {

    return [
      ...new Set(
        this.doctors
          .map(doctor => doctor.specialization)
          .filter(value => value)
      )
    ].sort();

  }


  /* =========================
     FILTER + SEARCH + SORT
     ========================= */

  get filteredDoctors(): Doctor[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();


    const filtered =
      this.doctors.filter(doctor => {

        const matchesSearch =
          !term ||

          doctor.name
            .toLowerCase()
            .includes(term) ||

          doctor.specialization
            .toLowerCase()
            .includes(term) ||

          doctor.phone
            .includes(term) ||

          doctor.email
            .toLowerCase()
            .includes(term);


        const matchesSpecialization =
          this.specializationFilter === 'ALL' ||
          doctor.specialization ===
          this.specializationFilter;


        return (
          matchesSearch &&
          matchesSpecialization
        );

      });


    return [...filtered].sort((a, b) => {

      let av: string | number;
      let bv: string | number;


      if (this.sortField === 'id') {

        av = a.id ?? 0;
        bv = b.id ?? 0;

      }

      else if (
        this.sortField === 'experience'
      ) {

        av = a.experience;
        bv = b.experience;

      }

      else if (
        this.sortField === 'name'
      ) {

        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();

      }

      else {

        av =
          a.specialization.toLowerCase();

        bv =
          b.specialization.toLowerCase();

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


  /* =========================
     PAGINATION
     ========================= */

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
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;


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
      (this.currentPage - 1) *
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
        length: this.totalPages
      },
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


  /* =========================
     SEARCH / FILTER
     ========================= */

  onSearchChange(): void {

    this.currentPage = 1;

  }


  onFilterChange(): void {

    this.currentPage = 1;

  }


  /* =========================
     SORT
     ========================= */

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

      this.sortField = field;

      this.sortDirection = 'asc';

    }


    this.currentPage = 1;

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


  /* =========================
     SUBMIT
     ========================= */

  submitDoctor(): void {

    if (
      !this.doctor.name ||
      !this.doctor.specialization ||
      !this.doctor.phone ||
      !this.doctor.email
    ) {

      this.showMessage(
        'Please fill all required fields.',
        'error'
      );

      return;

    }


    if (
      this.editingId !== null
    ) {

      this.updateDoctor();

    }

    else {

      this.createDoctor();

    }

  }


  /* =========================
     CREATE
     ========================= */

  private createDoctor(): void {

    this.loading = true;


    this.doctorService
      .createDoctor(this.doctor)
      .subscribe({

        next: (createdDoctor: Doctor) => {

          this.doctors = [
            ...this.doctors,
            createdDoctor
          ];


          this.loading = false;


          this.showMessage(
            'Doctor created successfully.'
          );


          this.resetForm();


          this.currentPage =
            this.totalPages;

        },


        error: (error: unknown) => {

          console.error(
            'Error creating doctor:',
            error
          );


          this.loading = false;


          this.showMessage(
            'Unable to create doctor.',
            'error'
          );

        }

      });

  }


  /* =========================
     EDIT
     ========================= */

  editDoctor(doctor: Doctor): void {

    this.editingId =
      doctor.id ?? null;


    this.doctor = {

      name: doctor.name,

      specialization:
        doctor.specialization,

      phone: doctor.phone,

      email: doctor.email,

      experience: doctor.experience

    };


    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }


  /* =========================
     UPDATE
     ========================= */

  private updateDoctor(): void {

    if (
      this.editingId === null
    ) {

      return;

    }


    this.loading = true;


    this.doctorService
      .updateDoctor(
        this.editingId,
        this.doctor
      )
      .subscribe({

        next: (updatedDoctor: Doctor) => {

          this.doctors =
            this.doctors.map(doctor =>

              doctor.id === this.editingId
                ? updatedDoctor
                : doctor

            );


          this.loading = false;


          this.showMessage(
            'Doctor updated successfully.'
          );


          this.resetForm();

        },


        error: (error: unknown) => {

          console.error(
            'Error updating doctor:',
            error
          );


          this.loading = false;


          this.showMessage(
            'Unable to update doctor.',
            'error'
          );

        }

      });

  }


  /* =========================
     DELETE
     ========================= */

  deleteDoctor(
    id: number | undefined
  ): void {

    if (
      id === undefined
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        'Are you sure you want to delete this doctor?'
      );


    if (!confirmed) {

      return;

    }


    this.loading = true;


    this.doctorService
      .deleteDoctor(id)
      .subscribe({

        next: () => {

          this.doctors =
            this.doctors.filter(
              doctor =>
                doctor.id !== id
            );


          this.loading = false;


          this.fixCurrentPage();


          this.showMessage(
            'Doctor deleted successfully.'
          );

        },


        error: (error: unknown) => {

          console.error(
            'Error deleting doctor:',
            error
          );


          this.loading = false;


          this.showMessage(
            'Unable to delete doctor.',
            'error'
          );

        }

      });

  }


  /* =========================
     RESET FORM
     ========================= */

  resetForm(): void {

    this.doctor = {

      name: '',

      specialization: '',

      phone: '',

      email: '',

      experience: 0

    };


    this.editingId = null;

  }


  /* =========================
     MANUAL REFRESH
     ========================= */

  refreshDoctors(): void {

    this.loadDoctors();

  }


  /* =========================
     MESSAGE
     ========================= */

  private showMessage(
    message: string,
    type:
      'success'
      | 'error' = 'success'
  ): void {

    this.message = message;

    this.messageType = type;


    setTimeout(() => {

      this.message = '';

    }, 3000);

  }

}