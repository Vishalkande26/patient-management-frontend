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

export interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  experience: number;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/doctors';

  private cacheKey =
    'doctors_cache';




  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });
  }


  
  getDoctors(): Observable<Doctor[]> {

    return this.http
      .get<Doctor[]>(
        this.apiUrl,
        {
          headers: this.getHeaders()
        }
      )
      .pipe(

        tap((doctors: Doctor[]) => {

          localStorage.setItem(
            this.cacheKey,
            JSON.stringify(doctors)
          );

        })

      );
  }


  

  getCachedDoctors(): Doctor[] {

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
      ) as Doctor[];

    } catch (error) {

      console.error(
        'Error reading doctor cache:',
        error
      );

      return [];
    }
  }


  

  setCachedDoctors(
    doctors: Doctor[]
  ): void {

    localStorage.setItem(
      this.cacheKey,
      JSON.stringify(doctors)
    );
  }


  
  clearCache(): void {

    localStorage.removeItem(
      this.cacheKey
    );
  }


 
  getDoctorById(
    id: number
  ): Observable<Doctor> {

    return this.http.get<Doctor>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


 

  createDoctor(
    doctor: Doctor
  ): Observable<Doctor> {

    return this.http.post<Doctor>(
      this.apiUrl,
      doctor,
      {
        headers: this.getHeaders()
      }
    );
  }


  
  updateDoctor(
    id: number,
    doctor: Doctor
  ): Observable<Doctor> {

    return this.http.put<Doctor>(
      `${this.apiUrl}/${id}`,
      doctor,
      {
        headers: this.getHeaders()
      }
    );
  }


 
  deleteDoctor(
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