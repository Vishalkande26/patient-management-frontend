import {
  Component,
  OnInit,
  inject,
  ViewEncapsulation
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

import {
  DoctorForm
} from './doctor-form/doctor-form';


@Component({
  selector: 'app-doctors',

  standalone: true,

  imports: [
    FormsModule,
    Modal,
    DoctorForm
  ],

  templateUrl: './doctors.html',

  styleUrl: './doctors.css',

  encapsulation:
    ViewEncapsulation.None
})
export class Doctors implements OnInit {

  private doctorService =
    inject(DoctorService);

  private router =
    inject(Router);


  doctor: Doctor = {

    name: '',

    specialization: '',

    phone: '',

    email: '',

    experience: 0

  };


  editingId:
    number | null = null;


  loading = false;

  saving = false;

  deleting = false;


  showDoctorModal = false;

  showDeleteModal = false;


  deleteDoctorId:
    number | undefined = undefined;

  deleteDoctorName = '';


  private deletedDoctorBackup:
    Doctor | undefined = undefined;


  message = '';

  messageType:
    'success' | 'error' = 'success';


  doctors: Doctor[] = [];


  searchTerm = '';

  specializationFilter = 'ALL';


  columnIdFilter = '';

  columnNameFilter = '';

  columnSpecializationFilter = '';

  columnPhoneFilter = '';

  columnEmailFilter = '';

  columnExperienceFilter = '';


  sortField:
    | 'id'
    | 'name'
    | 'specialization'
    | 'experience' = 'id';


  sortDirection:
    'asc' | 'desc' = 'asc';


  currentPage = 1;

  pageSize = 5;


  ngOnInit(): void {

    this.loadDoctors();

  }


  backToDashboard(): void {

    this.router.navigate([
      '/admin'
    ]);

  }


  loadDoctors(): void {

    this.loading = true;

    this.doctorService
      .getDoctors()
      .subscribe({

        next: (
          data: Doctor[]
        ) => {

          this.doctors =
            data.filter(
              (
                doctor:
                  Doctor & {
                    deleted?: boolean
                  }
              ) =>
                doctor.deleted !== true
            );

          this.loading = false;

          this.fixCurrentPage();

        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading doctors:',
            error
          );

          this.loading = false;

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


          const matchesSpecialization =
            this.specializationFilter ===
              'ALL' ||

            doctor.specialization ===
              this.specializationFilter;


          const matchesId =
            !idFilter ||

            String(
              doctor.id ?? ''
            )
              .toLowerCase()
              .includes(idFilter);


          const matchesName =
            !nameFilter ||

            doctor.name
              .toLowerCase()
              .includes(nameFilter);


          const matchesSpecializationColumn =
            !specializationColumnFilter ||

            specializationColumnFilter ===
              'all' ||

            doctor.specialization
              .toLowerCase()
              .includes(
                specializationColumnFilter
              );


          const matchesPhone =
            !phoneFilter ||

            doctor.phone
              .toLowerCase()
              .includes(phoneFilter);


          const matchesEmail =
            !emailFilter ||

            doctor.email
              .toLowerCase()
              .includes(emailFilter);


          const matchesExperience =
            !experienceFilter ||

            String(
              doctor.experience
            )
              .toLowerCase()
              .includes(
                experienceFilter
              );


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
              a.specialization.toLowerCase();

            valueB =
              b.specialization.toLowerCase();

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


        return this.sortDirection ===
          'asc'

          ? result

          : -result;

      }
    );

  }


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


    return this.filteredDoctors
      .slice(
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


  onSearchChange(): void {

    this.currentPage = 1;

  }


  clearSearch(): void {

    this.searchTerm = '';

    this.currentPage = 1;

  }


  onFilterChange(): void {

    this.currentPage = 1;

  }


  onColumnFilterChange(): void {

    this.currentPage = 1;

  }


  clearColumnFilters(): void {

    this.columnIdFilter = '';

    this.columnNameFilter = '';

    this.columnSpecializationFilter =
      '';

    this.columnPhoneFilter = '';

    this.columnEmailFilter = '';

    this.columnExperienceFilter =
      '';

    this.currentPage = 1;

  }


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


    return this.sortDirection ===
      'asc'

      ? '↑'

      : '↓';

  }


  clearFilters(): void {

    this.searchTerm = '';

    this.specializationFilter =
      'ALL';

    this.columnIdFilter = '';

    this.columnNameFilter = '';

    this.columnSpecializationFilter =
      '';

    this.columnPhoneFilter = '';

    this.columnEmailFilter = '';

    this.columnExperienceFilter =
      '';

    this.currentPage = 1;

  }


  openAddDoctorModal(): void {

    this.resetForm();

    this.editingId = null;

    this.showDoctorModal = true;

  }


  editDoctor(
    doctor: Doctor
  ): void {

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


  closeDoctorModal(): void {

    if (
      this.saving
    ) {

      return;

    }


    this.showDoctorModal =
      false;

  }


  submitDoctor(
    doctorData: Doctor
  ): void {

    if (
      this.saving
    ) {

      return;

    }


    this.doctor = {
      ...doctorData
    };


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


    const doctorRequest:
      Doctor = {

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


    if (
      this.editingId !== null
    ) {

      this.updateDoctor(
        doctorRequest
      );

      return;

    }


    this.createDoctor(
      doctorRequest
    );

  }


  private createDoctor(
    doctor: Doctor
  ): void {

    if (
      this.saving
    ) {

      return;

    }


    this.saving = true;


    const temporaryDoctor:
      Doctor = {

        id: undefined,

        name:
          doctor.name,

        specialization:
          doctor.specialization,

        phone:
          doctor.phone,

        email:
          doctor.email,

        experience:
          doctor.experience,

        isSaving: true

      };


    this.doctors = [

      ...this.doctors,

      temporaryDoctor

    ];


    this.currentPage =
      this.totalPages;


    this.showDoctorModal =
      false;


    this.resetForm();


    this.doctorService
      .createDoctor(
        doctor
      )
      .subscribe({

        next: (
          createdDoctor: Doctor
        ) => {

          this.doctors =
            this.doctors.map(
              (
                item: Doctor
              ) => {

                if (
                  item ===
                  temporaryDoctor
                ) {

                  return {

                    ...createdDoctor,

                    isSaving: false

                  };

                }


                return item;

              }
            );


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


          this.doctors =
            this.doctors.filter(
              (
                item: Doctor
              ) =>
                item !==
                temporaryDoctor
            );


          this.fixCurrentPage();


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


    this.saving = true;


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

          this.doctors =
            this.doctors.map(
              (
                item: Doctor
              ) =>
                item.id === id
                  ? updatedDoctor
                  : item
            );


          this.showDoctorModal =
            false;


          this.resetForm();


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


  openDeleteModal(
    doctor: Doctor
  ): void {

    if (
      doctor.id === undefined
    ) {

      return;

    }


    this.deleteDoctorId =
      doctor.id;


    this.deleteDoctorName =
      doctor.name;


    this.showDeleteModal =
      true;

  }


  closeDeleteModal(): void {

    this.showDeleteModal =
      false;


    this.deleteDoctorId =
      undefined;


    this.deleteDoctorName =
      '';

  }


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


    this.deletedDoctorBackup = {

      ...doctorToDelete

    };


    this.showDeleteModal =
      false;


    this.deleteDoctorId =
      undefined;


    this.deleteDoctorName =
      '';


    this.doctors =
      this.doctors.filter(
        (
          doctor: Doctor
        ) =>
          doctor.id !== id
      );


    this.fixCurrentPage();


    this.deleting = true;


    this.doctorService
      .deleteDoctor(id)
      .subscribe({

        next: () => {

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


  refreshDoctors(): void {

    this.loadDoctors();

  }


  private showMessage(
    message: string,
    type:
      'success' | 'error' = 'success'
  ): void {

    this.message =
      message;


    this.messageType =
      type;


    setTimeout(
      () => {

        this.message = '';

      },
      3000
    );

  }

}