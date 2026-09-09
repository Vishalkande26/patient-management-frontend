import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:8080/api/doctors';

  private cacheKey = 'doctors';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDoctors(): Observable<Doctor[]> {

    console.log('GET doctors:', this.apiUrl);

    return this.http.get<Doctor[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  createDoctor(doctor: Doctor): Observable<Doctor> {

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

  deleteDoctor(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getCachedDoctors(): Doctor[] {

    const data = localStorage.getItem(this.cacheKey);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  setCachedDoctors(doctors: Doctor[]): void {

    localStorage.setItem(
      this.cacheKey,
      JSON.stringify(doctors)
    );
  }

  clearCache(): void {

    localStorage.removeItem(this.cacheKey);
  }
}