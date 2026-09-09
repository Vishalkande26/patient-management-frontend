import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: number;
  patientId: number;
  patientName: string;
  patientDisease: string;
  patientAddress: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: string;
}

export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/appointments';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createAppointment(
    appointment: AppointmentRequest
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      this.apiUrl,
      appointment,
      { headers: this.getHeaders() }
    );
  }

  updateAppointment(
    id: number,
    appointment: AppointmentRequest
  ): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/${id}`,
      appointment,
      { headers: this.getHeaders() }
    );
  }

  deleteAppointment(id: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders(),
        responseType: 'text'
      }
    );
  }
}