import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  DoctorPatientService,
  Doctor,
  Patient
} from '../../services/doctor-patient.service';

@Component({
  selector: 'app-doctor-patient',

  imports: [
    FormsModule
  ],

  templateUrl: './doctor-patient.html',
  styleUrl: './doctor-patient.css'
})
export class DoctorPatient {

  // ==========================================
  // IDs
  // ==========================================

  doctorId: number | null = null;

  patientId: number | null = null;


  // ==========================================
  // DATA
  // ==========================================

  patients: Patient[] = [];

  doctors: Doctor[] = [];


  // ==========================================
  // MESSAGES
  // ==========================================

  message = '';

  errorMessage = '';


  constructor(
    private doctorPatientService: DoctorPatientService
  ) {}


  // ==========================================
  // ASSIGN
  // ==========================================

  assignDoctorToPatient(): void {

    this.clearMessages();

    if (
      this.doctorId === null ||
      this.patientId === null
    ) {

      this.errorMessage =
        'Please enter Doctor ID and Patient ID.';

      return;
    }


    this.doctorPatientService
      .assignDoctorToPatient(
        this.doctorId,
        this.patientId
      )
      .subscribe({

        next: (response: string) => {

          this.message = response;

          this.errorMessage = '';

          // Automatically refresh both sides
          this.loadPatientsByDoctor();

          this.loadDoctorsByPatient();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Assign doctor error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to assign doctor to patient.';

          this.message = '';
        }

      });
  }


  // ==========================================
  // REMOVE
  // ==========================================

  removeDoctorFromPatient(): void {

    this.clearMessages();

    if (
      this.doctorId === null ||
      this.patientId === null
    ) {

      this.errorMessage =
        'Please enter Doctor ID and Patient ID.';

      return;
    }


    this.doctorPatientService
      .removeDoctorFromPatient(
        this.doctorId,
        this.patientId
      )
      .subscribe({

        next: (response: string) => {

          this.message = response;

          this.errorMessage = '';

          // Refresh both sides
          this.loadPatientsByDoctor();

          this.loadDoctorsByPatient();
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Remove doctor error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to remove doctor from patient.';

          this.message = '';
        }

      });
  }


  // ==========================================
  // GET PATIENTS BY DOCTOR
  // ==========================================

  loadPatientsByDoctor(): void {

    this.clearMessages();

    if (this.doctorId === null) {

      this.errorMessage =
        'Please enter Doctor ID.';

      return;
    }


    this.doctorPatientService
      .getPatientsByDoctor(
        this.doctorId
      )
      .subscribe({

        next: (data: Patient[]) => {

          console.log(
            'Patients of doctor:',
            data
          );

          this.patients = data;

          this.errorMessage = '';
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Get patients error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to load patients.';
        }

      });
  }


  // ==========================================
  // GET DOCTORS BY PATIENT
  // ==========================================

  loadDoctorsByPatient(): void {

    this.clearMessages();

    if (this.patientId === null) {

      this.errorMessage =
        'Please enter Patient ID.';

      return;
    }


    this.doctorPatientService
      .getDoctorsByPatient(
        this.patientId
      )
      .subscribe({

        next: (data: Doctor[]) => {

          console.log(
            'Doctors of patient:',
            data
          );

          this.doctors = data;

          this.errorMessage = '';
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Get doctors error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to load doctors.';
        }

      });
  }


  // ==========================================
  // CLEAR MESSAGES
  // ==========================================

  clearMessages(): void {

    this.message = '';

    this.errorMessage = '';
  }
}