import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  disease: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/patients';

  private cacheKey =
    'patients_cache';


  

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });
  }


  
  getPatients(): Observable<Patient[]> {

    return this.http
      .get<Patient[]>(
        this.apiUrl,
        {
          headers: this.getHeaders()
        }
      )
      .pipe(

        tap((patients: Patient[]) => {

          localStorage.setItem(
            this.cacheKey,
            JSON.stringify(patients)
          );

        })

      );
  }


  
  getCachedPatients(): Patient[] {

    const cachedData =
      localStorage.getItem(
        this.cacheKey
      );

    if (!cachedData) {
      return [];
    }

    try {

      return JSON.parse(
        cachedData
      ) as Patient[];

    } catch (error) {

      console.error(
        'Error reading patient cache:',
        error
      );

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


  

  getPatientById(
    id: number
  ): Observable<Patient> {

    return this.http.get<Patient>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
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
        headers: this.getHeaders()
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
        headers: this.getHeaders()
      }
    );
  }


  

  deletePatient(
    id: number
  ): Observable<string> {

    return this.http.delete<string>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}