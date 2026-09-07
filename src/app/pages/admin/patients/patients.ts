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

@Component({
  selector: 'app-patients',
  imports: [
    FormsModule
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class Patients implements OnInit {

  private patientService =
    inject(PatientService);

  private router =
    inject(Router);

  patients: Patient[] = [];

  loading = false;


  

  name = '';

  age: number = 0;

  gender = '';

  phone = '';

  disease = '';

  address = '';


  

  editingId: number | null = null;


  

  showPopup = false;

  popupMessage = '';

  popupType:
    'success' | 'error' = 'success';


  

  ngOnInit(): void {

    
    this.patients =
      this.patientService
        .getCachedPatients();

   
    this.loadPatients();
  }


  
  loadPatients(): void {

    this.loading = true;

    this.patientService
      .getPatients()
      .subscribe({

        next: (data: Patient[]) => {

          console.log(
            'Latest patients loaded:',
            data
          );

          this.patients = data;

          this.loading = false;
        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading patients:',
            error
          );

          this.loading = false;

          
          if (this.patients.length > 0) {
            return;
          }

          if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can view patients.'
            );

          } else {

            this.showError(
              'Failed to load patients.'
            );
          }
        }
      });
  }


  

  savePatient(): void {

    if (
      !this.name.trim() ||
      !this.gender.trim() ||
      !this.phone.trim() ||
      !this.disease.trim() ||
      !this.address.trim()
    ) {

      this.showError(
        'Please fill all fields.'
      );

      return;
    }


    if (
      this.age === null ||
      this.age === undefined ||
      this.age < 1
    ) {

      this.showError(
        'Age must be greater than 0.'
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


    const patient: Patient = {

      name:
        this.name.trim(),

      age:
        Number(this.age),

      gender:
        this.gender.trim(),

      phone:
        this.phone.trim(),

      disease:
        this.disease.trim(),

      address:
        this.address.trim()
    };


    console.log(
      'Patient data being sent:',
      patient
    );


    

    if (this.editingId === null) {

      this.patientService
        .createPatient(patient)
        .subscribe({

          next: (response: Patient) => {

            console.log(
              'Patient added:',
              response
            );

            
            this.patients = [
              ...this.patients,
              response
            ];

           
            this.patientService
              .setCachedPatients(
                this.patients
              );

            this.clearForm();

           
            this.loadPatients();

            this.showSuccess(
              'Patient added successfully!'
            );
          },

          error: (
            error: HttpErrorResponse
          ) => {

            console.error(
              'Add patient error:',
              error
            );

            if (error.status === 400) {

              this.showError(
                'Invalid patient data. Please check all fields.'
              );

            } else if (error.status === 401) {

              this.showError(
                'Please login again.'
              );

            } else if (error.status === 403) {

              this.showError(
                'Only admin can add patients.'
              );

            } else {

              this.showError(
                'Failed to add patient.'
              );
            }
          }
        });

      return;
    }


    
    this.patientService
      .updatePatient(
        this.editingId,
        patient
      )
      .subscribe({

        next: (response: Patient) => {

          console.log(
            'Patient updated:',
            response
          );

          
          this.patients =
            this.patients.map(
              (item: Patient) =>
                item.id === response.id
                  ? response
                  : item
            );

          
          this.patientService
            .setCachedPatients(
              this.patients
            );

          this.clearForm();

          
          this.loadPatients();

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

          if (error.status === 400) {

            this.showError(
              'Invalid patient data. Please check all fields.'
            );

          } else if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can update patients.'
            );

          } else if (error.status === 404) {

            this.showError(
              'Patient not found.'
            );

          } else {

            this.showError(
              'Failed to update patient.'
            );
          }
        }
      });
  }


  
  editPatient(
    patient: Patient
  ): void {

    this.editingId =
      patient.id ?? null;

    this.name =
      patient.name;

    this.age =
      patient.age ?? 0;

    this.gender =
      patient.gender;

    this.phone =
      patient.phone;

    this.disease =
      patient.disease;

    this.address =
      patient.address;

    this.popupMessage = '';

    this.showPopup = false;
  }


  // ============================
  // DELETE PATIENT
  // ============================

  deletePatient(
    id: number | undefined
  ): void {

    if (id === undefined) {
      return;
    }


    const confirmed =
      confirm(
        'Are you sure you want to delete this patient?'
      );


    if (!confirmed) {
      return;
    }


    this.patientService
      .deletePatient(id)
      .subscribe({

        next: () => {

          console.log(
            'Patient deleted:',
            id
          );

          /*
           * Remove immediately from list.
           */
          this.patients =
            this.patients.filter(
              (patient: Patient) =>
                patient.id !== id
            );

          /*
           * Update cache.
           */
          this.patientService
            .setCachedPatients(
              this.patients
            );

          this.showSuccess(
            'Patient deleted successfully!'
          );

          /*
           * Background refresh.
           */
          this.loadPatients();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Delete patient error:',
            error
          );

          if (error.status === 401) {

            this.showError(
              'Please login again.'
            );

          } else if (error.status === 403) {

            this.showError(
              'Only admin can delete patients.'
            );

          } else if (error.status === 404) {

            this.showError(
              'Patient not found.'
            );

          } else {

            this.showError(
              'Failed to delete patient.'
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

    this.age = 0;

    this.gender = '';

    this.phone = '';

    this.disease = '';

    this.address = '';

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
     * Clear patient cache
     * when logging out.
     */
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