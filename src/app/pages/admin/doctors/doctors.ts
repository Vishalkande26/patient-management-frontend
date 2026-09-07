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

@Component({
  selector: 'app-doctors',
  imports: [
    FormsModule
  ],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {

  private doctorService =
    inject(DoctorService);

  private router =
    inject(Router);

  doctors: Doctor[] = [];

  loading = false;


  // ============================
  // FORM FIELDS
  // ============================

  name = '';
  specialization = '';
  phone = '';
  email = '';
  experience: number = 0;


  // ============================
  // EDIT MODE
  // ============================

  editingId: number | null = null;


  // ============================
  // TOAST
  // ============================

  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';


  // ============================
  // INITIALIZE
  // ============================

  ngOnInit(): void {

    /*
     * First show cached doctors immediately.
     */
    this.doctors =
      this.doctorService
        .getCachedDoctors();

    /*
     * Then get latest data
     * from backend in background.
     */
    this.loadDoctors();
  }


  // ============================
  // LOAD DOCTORS
  // ============================

  loadDoctors(): void {

    this.loading = true;

    this.doctorService
      .getDoctors()
      .subscribe({

        next: (data: Doctor[]) => {

          console.log(
            'Latest doctors loaded:',
            data
          );

          this.doctors = data;

          this.loading = false;
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Error loading doctors:',
            error
          );

          this.loading = false;

          /*
           * If cached data already exists,
           * keep showing it.
           */
          if (this.doctors.length > 0) {
            return;
          }

          if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can view doctors.'
            );

          } else {

            this.showError(
              'Failed to load doctors.'
            );
          }
        }
      });
  }


  // ============================
  // SAVE DOCTOR
  // ============================

  saveDoctor(): void {

    if (
      !this.name.trim() ||
      !this.specialization.trim() ||
      !this.phone.trim() ||
      !this.email.trim()
    ) {

      this.showError(
        'Please fill all fields.'
      );

      return;
    }


    if (
      !/^[0-9]{10}$/.test(
        this.phone.trim()
      )
    ) {

      this.showError(
        'Phone number must be exactly 10 digits.'
      );

      return;
    }


    if (
      this.experience === null ||
      this.experience === undefined ||
      this.experience < 0
    ) {

      this.showError(
        'Please enter valid experience.'
      );

      return;
    }


    const doctor: Doctor = {

      name:
        this.name.trim(),

      specialization:
        this.specialization.trim(),

      phone:
        this.phone.trim(),

      email:
        this.email.trim(),

      experience:
        Number(this.experience)
    };


    console.log(
      'Doctor data being sent:',
      doctor
    );


    // ============================
    // CREATE
    // ============================

    if (this.editingId === null) {

      this.doctorService
        .createDoctor(doctor)
        .subscribe({

          next: (response: Doctor) => {

            console.log(
              'Doctor added:',
              response
            );

            /*
             * Add the new doctor
             * immediately to the list.
             */
            this.doctors = [
              ...this.doctors,
              response
            ];

            /*
             * Update cache immediately.
             */
            this.doctorService
              .setCachedDoctors(
                this.doctors
              );

            this.clearForm();

            /*
             * Get latest database data
             * in background.
             */
            this.loadDoctors();

            this.showSuccess(
              'Doctor added successfully!'
            );
          },

          error: (
            error: HttpErrorResponse
          ) => {

            console.error(
              'Add doctor error:',
              error
            );

            if (error.status === 400) {

              this.showError(
                'Invalid doctor data. Please check all fields.'
              );

            } else if (error.status === 401) {

              this.showError(
                'Please login again.'
              );

            } else if (error.status === 403) {

              this.showError(
                'Only admin can add doctors.'
              );

            } else {

              this.showError(
                'Failed to add doctor.'
              );
            }
          }
        });

      return;
    }


    // ============================
    // UPDATE
    // ============================

    this.doctorService
      .updateDoctor(
        this.editingId,
        doctor
      )
      .subscribe({

        next: (response: Doctor) => {

          console.log(
            'Doctor updated:',
            response
          );

          /*
           * Update doctor immediately
           * in the current list.
           */
          this.doctors =
            this.doctors.map(
              (item: Doctor) =>
                item.id === response.id
                  ? response
                  : item
            );

          /*
           * Update cache.
           */
          this.doctorService
            .setCachedDoctors(
              this.doctors
            );

          this.clearForm();

          /*
           * Background refresh.
           */
          this.loadDoctors();

          this.showSuccess(
            'Doctor updated successfully!'
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Update doctor error:',
            error
          );

          if (error.status === 400) {

            this.showError(
              'Invalid doctor data. Please check all fields.'
            );

          } else if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can update doctors.'
            );

          } else if (error.status === 404) {

            this.showError(
              'Doctor not found.'
            );

          } else {

            this.showError(
              'Failed to update doctor.'
            );
          }
        }
      });
  }


  // ============================
  // EDIT DOCTOR
  // ============================

  editDoctor(
    doctor: Doctor
  ): void {

    this.editingId =
      doctor.id ?? null;

    this.name =
      doctor.name;

    this.specialization =
      doctor.specialization;

    this.phone =
      doctor.phone;

    this.email =
      doctor.email;

    this.experience =
      doctor.experience ?? 0;

    this.popupMessage = '';

    this.showPopup = false;
  }


  // ============================
  // DELETE DOCTOR
  // ============================

  deleteDoctor(
    id: number | undefined
  ): void {

    if (id === undefined) {
      return;
    }


    const confirmed =
      confirm(
        'Are you sure you want to delete this doctor?'
      );


    if (!confirmed) {
      return;
    }


    this.doctorService
      .deleteDoctor(id)
      .subscribe({

        next: () => {

          console.log(
            'Doctor deleted:',
            id
          );

          /*
           * Remove doctor immediately
           * from current list.
           */
          this.doctors =
            this.doctors.filter(
              (doctor: Doctor) =>
                doctor.id !== id
            );

          /*
           * Update cache immediately.
           */
          this.doctorService
            .setCachedDoctors(
              this.doctors
            );

          this.showSuccess(
            'Doctor deleted successfully!'
          );

          /*
           * Get latest database data
           * in background.
           */
          this.loadDoctors();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Delete doctor error:',
            error
          );

          if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can delete doctors.'
            );

          } else if (error.status === 404) {

            this.showError(
              'Doctor not found.'
            );

          } else {

            this.showError(
              'Failed to delete doctor.'
            );
          }
        }
      });
  }


  // ============================
  // CLEAR FORM
  // ============================

  clearForm(): void {

    this.name = '';

    this.specialization = '';

    this.phone = '';

    this.email = '';

    this.experience = 0;

    this.editingId = null;
  }


  // ============================
  // SUCCESS TOAST
  // ============================

  showSuccess(
    message: string
  ): void {

    this.popupMessage =
      message;

    this.popupType =
      'success';

    this.showPopup =
      true;

    setTimeout(() => {

      this.showPopup =
        false;

    }, 2500);
  }


  // ============================
  // ERROR TOAST
  // ============================

  showError(
    message: string
  ): void {

    this.popupMessage =
      message;

    this.popupType =
      'error';

    this.showPopup =
      true;

    setTimeout(() => {

      this.showPopup =
        false;

    }, 3000);
  }


  // ============================
  // BACK
  // ============================

  goBack(): void {

    this.router.navigate([
      '/admin'
    ]);
  }


  // ============================
  // LOGOUT
  // ============================

  logout(): void {

    /*
     * Clear doctor cache when
     * logging out.
     */
    this.doctorService
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