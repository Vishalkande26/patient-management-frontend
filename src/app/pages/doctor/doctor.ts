import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { Doctor as DoctorProfile, DoctorService } from '../../services/doctor.service';
import { DoctorPatientService, Patient } from '../../services/doctor-patient.service';
import { PatientService, Patient as PatientRecord } from '../../services/patient.service';
import { Appointment, AppointmentService } from '../../services/appointment.service';

type DoctorView = 'dashboard' | 'patients' | 'appointments';

@Component({
  selector: 'app-doctor',
  imports: [CommonModule],
  templateUrl: './doctor.html',
  styleUrl: './doctor.css'
})
export class Doctor implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private doctorService = inject(DoctorService);
  private doctorPatientService = inject(DoctorPatientService);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private cdr = inject(ChangeDetectorRef);

  activeView: DoctorView = 'dashboard';
  doctor: DoctorProfile | null = null;
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  isProfileLoading = true;
  isPatientsLoading = false;
  isAppointmentsLoading = false;
  errorMessage = '';

  get username(): string {
    return this.authService.getUsername() ?? 'Doctor';
  }

  get doctorDisplayName(): string {
    const raw = this.username.trim();
    if (raw.toLowerCase() === 'doctor') {
      return '';
    }
    return raw.replace(/^dr\.?\s+/i, '');
  }

  get appointmentCount(): number {
    return this.appointments.length;
  }

  ngOnInit(): void {
    this.loadDoctorProfile();
  }

  selectView(view: DoctorView): void {
    this.activeView = view;

    if (view === 'patients' && this.patients.length === 0) {
      this.loadPatients();
    }

    if (view === 'appointments' && this.appointments.length === 0) {
      this.loadAppointments();
    }

    this.cdr.detectChanges();
  }

  refreshActiveView(): void {
    if (this.activeView === 'patients') {
      this.loadPatients();
    } else if (this.activeView === 'appointments') {
      this.loadAppointments();
    } else {
      this.loadDoctorProfile();
    }

    this.cdr.detectChanges();
  }

  private loadDoctorProfile(): void {
    const email = this.authService.getEmail()?.trim().toLowerCase();
    const currentUsername = this.authService.getUsername()?.trim().toLowerCase();

    if (!email) {
      this.isProfileLoading = false;
      this.errorMessage = 'Your account email is unavailable. Please sign in again.';
      this.cdr.detectChanges();
      return;
    }

    // Check cached doctors first for instant rendering
    const cached = this.doctorService.getCachedDoctors();
    if (cached && cached.length > 0) {
      const match = cached.find(
        d => d.email?.trim().toLowerCase() === email
      ) ?? (currentUsername ? cached.find(
        d => d.name?.trim().toLowerCase() === currentUsername ||
             d.name?.trim().toLowerCase().replace(/^dr\.?\s+/i, '') === currentUsername.replace(/^dr\.?\s+/i, '')
      ) : null) ?? null;

      if (match?.id) {
        this.doctor = match;
        this.isProfileLoading = false;
        this.loadPatients();
        this.loadAppointments();
        this.cdr.detectChanges();
      }
    }

    if (!this.doctor) {
      this.isProfileLoading = true;
    }
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        const doctorList = doctors ?? [];
        this.doctorService.setCachedDoctors(doctorList);

        this.doctor = doctorList.find(
          doctor => doctor.email?.trim().toLowerCase() === email
        ) ?? (currentUsername ? doctorList.find(
          d => d.name?.trim().toLowerCase() === currentUsername ||
               d.name?.trim().toLowerCase().replace(/^dr\.?\s+/i, '') === currentUsername.replace(/^dr\.?\s+/i, '')
        ) : null) ?? null;

        this.isProfileLoading = false;

        if (!this.doctor?.id) {
          this.errorMessage = 'No active doctor profile matches this account email. Ask an administrator to create or update the doctor profile.';
          this.cdr.detectChanges();
          return;
        }

        this.loadPatients();
        this.loadAppointments();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isProfileLoading = false;
        this.errorMessage = 'Unable to load your doctor profile. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadPatients(): void {
    if (!this.doctor?.id) {
      return;
    }

    this.isPatientsLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const doctorId = Number(this.doctor.id);

    const assigned$ = this.doctorPatientService.getPatientsByDoctor(doctorId).pipe(
      catchError(() => of([] as Patient[]))
    );

    const allPatients$ = this.patientService.getPatients().pipe(
      catchError(() => of([] as PatientRecord[]))
    );

    const appointments$ = this.appointments.length > 0
      ? of(this.appointments)
      : this.appointmentService.getAppointments().pipe(
          catchError(() => of([] as Appointment[]))
        );

    forkJoin({
      assigned: assigned$,
      allPatients: allPatients$,
      appointments: appointments$
    }).subscribe({
      next: ({ assigned, allPatients, appointments }) => {
        const docAppts = (appointments ?? []).filter(
          a => Number(a.doctorId) === doctorId
        );
        this.appointments = docAppts;

        const patientMap = new Map<number, Patient>();

        // 1. Add patients directly assigned to this doctor
        for (const p of assigned ?? []) {
          if (p && p.id) {
            patientMap.set(Number(p.id), {
              id: Number(p.id),
              name: p.name || `Patient #${p.id}`,
              age: p.age ?? 0,
              gender: p.gender || '-',
              phone: p.phone || '-',
              disease: p.disease || 'Not recorded',
              address: p.address || ''
            });
          }
        }

        // 2. Add patients who have appointments booked with this doctor
        const allPatientsMap = new Map<number, PatientRecord>();
        for (const p of allPatients ?? []) {
          if (p && p.id != null) {
            allPatientsMap.set(Number(p.id), p);
          }
        }

        for (const appt of docAppts) {
          const pid = Number(appt.patientId);
          if (pid && !patientMap.has(pid)) {
            const found = allPatientsMap.get(pid);
            if (found) {
              patientMap.set(pid, {
                id: pid,
                name: found.name || appt.patientName || `Patient #${pid}`,
                age: found.age ?? 0,
                gender: found.gender || '-',
                phone: found.phone || '-',
                disease: found.disease || appt.patientDisease || appt.reason || 'Not recorded',
                address: found.address || appt.patientAddress || ''
              });
            } else {
              patientMap.set(pid, {
                id: pid,
                name: appt.patientName || `Patient #${pid}`,
                age: 0,
                gender: '-',
                phone: '-',
                disease: appt.patientDisease || appt.reason || 'Not recorded',
                address: appt.patientAddress || ''
              });
            }
          }
        }

        this.patients = Array.from(patientMap.values());
        this.isPatientsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isPatientsLoading = false;
        this.errorMessage = 'Unable to load your patients. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadAppointments(): void {
    if (!this.doctor?.id) {
      return;
    }

    this.isAppointmentsLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = (appointments ?? []).filter(
          appointment => Number(appointment.doctorId) === Number(this.doctor?.id)
        );
        this.isAppointmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isAppointmentsLoading = false;
        this.errorMessage = 'Unable to load your appointments. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  formatStatus(status: string): string {
    return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Unknown';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
