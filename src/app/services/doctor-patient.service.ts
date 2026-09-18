import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


export interface Patient {

  id: number;

  name: string;

  age: number;

  gender: string;

  phone: string;

  disease: string;

  address: string;
}


export interface Doctor {

  id: number;

  name: string;

  specialization: string;

  phone: string;

  email: string;

  experience: number;
}


@Injectable({
  providedIn: 'root'
})
export class DoctorPatientService {

  private apiUrl =
    `${environment.apiUrl}/api/doctor-patient`;


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // ASSIGN DOCTOR TO PATIENT
  // ==========================================

  assignDoctorToPatient(
    doctorId: number,
    patientId: number
  ): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/doctors/${doctorId}/patients/${patientId}`,
      {},
      {
        responseType: 'text'
      }
    );
  }


  // ==========================================
  // REMOVE DOCTOR FROM PATIENT
  // ==========================================

  removeDoctorFromPatient(
    doctorId: number,
    patientId: number
  ): Observable<string> {

    return this.http.delete(
      `${this.apiUrl}/doctors/${doctorId}/patients/${patientId}`,
      {
        responseType: 'text'
      }
    );
  }


  // ==========================================
  // GET PATIENTS OF DOCTOR
  // ==========================================

  getPatientsByDoctor(
    doctorId: number
  ): Observable<Patient[]> {

    return this.http.get<Patient[]>(
      `${this.apiUrl}/doctors/${doctorId}/patients`
    );
  }


  // ==========================================
  // GET DOCTORS OF PATIENT
  // ==========================================

  getDoctorsByPatient(
    patientId: number
  ): Observable<Doctor[]> {

    return this.http.get<Doctor[]>(
      `${this.apiUrl}/patients/${patientId}/doctors`
    );
  }

}