import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


export interface Patient {

  id?: number;

  name: string;

  age: number;

  gender: string;

  phone: string;

  disease: string;

  address: string;

  deleted?: boolean;

  isSaving?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private http = inject(HttpClient);


  private apiUrl =
    `${environment.apiUrl}/api/patients`;


  private cacheKey =
    'patients';


  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');


    return new HttpHeaders({

      'Content-Type':
        'application/json',

      'Authorization':
        `Bearer ${token}`

    });
  }


  getPatients(): Observable<Patient[]> {

    console.log(
      'GET patients:',
      this.apiUrl
    );


    return this.http.get<Patient[]>(
      this.apiUrl,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  createPatient(
    patient: Patient
  ): Observable<Patient> {

    return this.http.post<Patient>(
      this.apiUrl,
      patient,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  updatePatient(
    id: number,
    patient: Patient
  ): Observable<Patient> {

    return this.http.put<Patient>(
      `${this.apiUrl}/${id}`,
      patient,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  deletePatient(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  getCachedPatients(): Patient[] {

    const data =
      localStorage.getItem(
        this.cacheKey
      );


    if (!data) {

      return [];
    }


    try {

      return JSON.parse(data);

    } catch {

      return [];
    }
  }


  setCachedPatients(
    patients: Patient[]
  ): void {

    localStorage.setItem(
      this.cacheKey,
      JSON.stringify(patients)
    );
  }


  clearCache(): void {

    localStorage.removeItem(
      this.cacheKey
    );
  }

}