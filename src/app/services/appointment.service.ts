import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentRequest {

  patientId: number;

  doctorId: number;

  appointmentDate: string;

  appointmentTime: string;

  reason: string;

  status: string;
}

export interface Appointment {

  id?: number;

  patientId?: number;

  doctorId?: number;

  patientName?: string;

  patientDisease?: string;

  patientAddress?: string;

  doctorName?: string;

  doctorSpecialization?: string;

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

  private readonly apiUrl =
    'http://localhost:8080/api/appointments';

  // Carries a newly-created appointment to the list page so it can be shown
  // before the follow-up API refresh has finished.
  private recentlyCreatedAppointment: Appointment | null = null;

  rememberCreatedAppointment(
    appointment: Appointment
  ): void {

    this.recentlyCreatedAppointment = appointment;
  }

  consumeRecentlyCreatedAppointment(): Appointment | null {

    const appointment = this.recentlyCreatedAppointment;

    this.recentlyCreatedAppointment = null;

    return appointment;
  }


  // ==========================================
  // CREATE APPOINTMENT
  // ==========================================

  createAppointment(
    appointment: AppointmentRequest
  ): Observable<Appointment> {

    return this.http.post<Appointment>(
      this.apiUrl,
      appointment
    );
  }


  // ==========================================
  // GET ALL APPOINTMENTS
  // ==========================================

  getAppointments(): Observable<Appointment[]> {

    return this.http.get<Appointment[]>(
      this.apiUrl
    );
  }


  // ==========================================
  // GET APPOINTMENT BY ID
  // ==========================================

  getAppointmentById(
    id: number
  ): Observable<Appointment> {

    return this.http.get<Appointment>(
      `${this.apiUrl}/${id}`
    );
  }


  // ==========================================
  // UPDATE APPOINTMENT
  // ==========================================

  updateAppointment(
    id: number,
    appointment: AppointmentRequest
  ): Observable<Appointment> {

    return this.http.put<Appointment>(
      `${this.apiUrl}/${id}`,
      appointment
    );
  }


  // ==========================================
  // DELETE APPOINTMENT
  // ==========================================

  deleteAppointment(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
