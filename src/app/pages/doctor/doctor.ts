import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import { AuthService } from '../../services/auth.service';

import {
  Doctor as DoctorProfile,
  DoctorService
} from '../../services/doctor.service';

import {
  DoctorPatientService,
  Patient
} from '../../services/doctor-patient.service';

import {
  PatientService,
  Patient as PatientRecord
} from '../../services/patient.service';

import {
  Appointment,
  AppointmentRequest,
  AppointmentService
} from '../../services/appointment.service';

/*
 * PrimeNG
 */
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';


type DoctorView =
  | 'dashboard'
  | 'patients'
  | 'appointments';


@Component({
  selector: 'app-doctor',

  imports: [
    CommonModule,

    /*
     * PrimeNG
     */
    ButtonModule,
    TagModule,
    BadgeModule
  ],

  templateUrl: './doctor.html',

  styleUrl: './doctor.css'
})
export class Doctor implements OnInit {

  private router =
    inject(Router);

  private authService =
    inject(AuthService);

  private doctorService =
    inject(DoctorService);

  private doctorPatientService =
    inject(DoctorPatientService);

  private patientService =
    inject(PatientService);

  private appointmentService =
    inject(AppointmentService);

  private cdr =
    inject(ChangeDetectorRef);


  /*
   * Current page
   */
  activeView: DoctorView =
    'dashboard';


  /*
   * Doctor profile
   */
  doctor: DoctorProfile | null =
    null;


  /*
   * Patients
   */
  patients: Patient[] = [];


  /*
   * Appointments
   */
  appointments: Appointment[] =
    [];


  /*
   * Loading
   */
  isProfileLoading =
    true;

  isPatientsLoading =
    false;

  isAppointmentsLoading =
    false;


  /*
   * General error
   */
  errorMessage =
    '';


  /*
   * Appointment action state
   */
  updatingAppointmentId:
    number | null = null;

  appointmentActionMessage =
    '';

  appointmentActionError =
    '';


  /*
   * USERNAME
   */
  get username(): string {

    return this.authService.getUsername()
      ?? 'Doctor';
  }


  /*
   * DOCTOR DISPLAY NAME
   *
   * If username is:
   * Dr Rohit Sharma
   *
   * returns:
   * Rohit Sharma
   */
  get doctorDisplayName(): string {

    const raw =
      this.username.trim();

    if (
      raw.toLowerCase() === 'doctor'
    ) {
      return '';
    }

    return raw.replace(
      /^dr\.?\s+/i,
      ''
    );
  }


  /*
   * APPOINTMENT COUNT
   */
  get appointmentCount(): number {

    return this.appointments.length;
  }


  /*
   * INITIALIZE
   */
  ngOnInit(): void {

    this.loadDoctorProfile();
  }


  /*
   * CHANGE VIEW
   */
  selectView(
    view: DoctorView
  ): void {

    this.activeView =
      view;


    if (
      view === 'patients' &&
      this.patients.length === 0
    ) {

      this.loadPatients();
    }


    if (
      view === 'appointments' &&
      this.appointments.length === 0
    ) {

      this.loadAppointments();
    }


    this.cdr.detectChanges();
  }


  /*
   * REFRESH
   */
  refreshActiveView(): void {

    if (
      this.activeView === 'patients'
    ) {

      this.loadPatients();

    } else if (
      this.activeView === 'appointments'
    ) {

      this.loadAppointments();

    } else {

      this.loadDoctorProfile();
    }


    this.cdr.detectChanges();
  }


  /*
   * LOAD DOCTOR PROFILE
   */
  private loadDoctorProfile(): void {

    const email =
      this.authService
        .getEmail()
        ?.trim()
        .toLowerCase();


    const currentUsername =
      this.authService
        .getUsername()
        ?.trim()
        .toLowerCase();


    if (!email) {

      this.isProfileLoading =
        false;

      this.errorMessage =
        'Your account email is unavailable. Please sign in again.';

      this.cdr.detectChanges();

      return;
    }


    /*
     * Use cached doctors first
     */
    const cached =
      this.doctorService
        .getCachedDoctors();


    if (
      cached &&
      cached.length > 0
    ) {

      const match =
        cached.find(
          doctor =>
            doctor.email
              ?.trim()
              .toLowerCase() === email
        )
        ??
        (
          currentUsername
            ? cached.find(
                doctor =>
                  doctor.name
                    ?.trim()
                    .toLowerCase() ===
                    currentUsername

                  ||

                  doctor.name
                    ?.trim()
                    .toLowerCase()
                    .replace(
                      /^dr\.?\s+/i,
                      ''
                    ) ===
                    currentUsername
                      .replace(
                        /^dr\.?\s+/i,
                        ''
                      )
              )
            : null
        )
        ??
        null;


      if (match?.id) {

        this.doctor =
          match;

        this.isProfileLoading =
          false;

        this.loadPatients();

        this.loadAppointments();

        this.cdr.detectChanges();
      }
    }


    if (!this.doctor) {

      this.isProfileLoading =
        true;
    }


    this.errorMessage =
      '';

    this.cdr.detectChanges();


    /*
     * Get latest doctors
     */
    this.doctorService
      .getDoctors()
      .subscribe({

        next: (doctors) => {

          const doctorList =
            doctors ?? [];


          this.doctorService
            .setCachedDoctors(
              doctorList
            );


          this.doctor =
            doctorList.find(
              doctor =>
                doctor.email
                  ?.trim()
                  .toLowerCase() === email
            )
            ??
            (
              currentUsername
                ? doctorList.find(
                    doctor =>
                      doctor.name
                        ?.trim()
                        .toLowerCase() ===
                        currentUsername

                      ||

                      doctor.name
                        ?.trim()
                        .toLowerCase()
                        .replace(
                          /^dr\.?\s+/i,
                          ''
                        ) ===
                        currentUsername
                          .replace(
                            /^dr\.?\s+/i,
                            ''
                          )
                  )
                : null
            )
            ??
            null;


          this.isProfileLoading =
            false;


          if (!this.doctor?.id) {

            this.errorMessage =
              'No active doctor profile matches this account email. Ask an administrator to create or update the doctor profile.';

            this.cdr.detectChanges();

            return;
          }


          this.loadPatients();

          this.loadAppointments();

          this.cdr.detectChanges();
        },


        error: () => {

          this.isProfileLoading =
            false;

          this.errorMessage =
            'Unable to load your doctor profile. Please try again.';

          this.cdr.detectChanges();
        }

      });
  }


  /*
   * LOAD PATIENTS
   */
  private loadPatients(): void {

    if (!this.doctor?.id) {

      return;
    }


    this.isPatientsLoading =
      true;

    this.errorMessage =
      '';

    this.cdr.detectChanges();


    const doctorId =
      Number(
        this.doctor.id
      );


    const assigned$ =
      this.doctorPatientService
        .getPatientsByDoctor(
          doctorId
        )
        .pipe(
          catchError(
            () =>
              of([] as Patient[])
          )
        );


    const allPatients$ =
      this.patientService
        .getPatients()
        .pipe(
          catchError(
            () =>
              of([] as PatientRecord[])
          )
        );


    const appointments$ =
      this.appointments.length > 0
        ? of(this.appointments)
        : this.appointmentService
            .getAppointments()
            .pipe(
              catchError(
                () =>
                  of([] as Appointment[])
              )
            );


    forkJoin({

      assigned:
        assigned$,

      allPatients:
        allPatients$,

      appointments:
        appointments$

    }).subscribe({

      next: ({
        assigned,
        allPatients,
        appointments
      }) => {

        /*
         * Doctor appointments
         */
        const docAppts =
          (
            appointments ?? []
          ).filter(
            appointment =>
              Number(
                appointment.doctorId
              ) === doctorId
          );


        this.appointments =
          docAppts;


        /*
         * Patient map
         */
        const patientMap =
          new Map<
            number,
            Patient
          >();


        /*
         * Assigned patients
         */
        for (
          const patient of
          assigned ?? []
        ) {

          if (
            patient &&
            patient.id != null
          ) {

            patientMap.set(
              Number(patient.id),

              {
                id:
                  Number(patient.id),

                name:
                  patient.name ||
                  `Patient #${patient.id}`,

                age:
                  patient.age ?? 0,

                gender:
                  patient.gender || '-',

                phone:
                  patient.phone || '-',

                disease:
                  patient.disease ||
                  'Not recorded',

                address:
                  patient.address || ''
              }
            );
          }
        }


        /*
         * All patients
         */
        const allPatientsMap =
          new Map<
            number,
            PatientRecord
          >();


        for (
          const patient of
          allPatients ?? []
        ) {

          if (
            patient &&
            patient.id != null
          ) {

            allPatientsMap.set(
              Number(patient.id),
              patient
            );
          }
        }


        /*
         * Add appointment patients
         */
        for (
          const appointment of
          docAppts
        ) {

          const patientId =
            Number(
              appointment.patientId
            );


          if (
            patientId &&
            !patientMap.has(
              patientId
            )
          ) {

            const found =
              allPatientsMap.get(
                patientId
              );


            if (found) {

              patientMap.set(
                patientId,

                {
                  id:
                    patientId,

                  name:
                    found.name ||
                    appointment.patientName ||
                    `Patient #${patientId}`,

                  age:
                    found.age ?? 0,

                  gender:
                    found.gender || '-',

                  phone:
                    found.phone || '-',

                  disease:
                    found.disease ||
                    appointment.patientDisease ||
                    appointment.reason ||
                    'Not recorded',

                  address:
                    found.address ||
                    appointment.patientAddress ||
                    ''
                }
              );

            } else {

              patientMap.set(
                patientId,

                {
                  id:
                    patientId,

                  name:
                    appointment.patientName ||
                    `Patient #${patientId}`,

                  age:
                    0,

                  gender:
                    '-',

                  phone:
                    '-',

                  disease:
                    appointment.patientDisease ||
                    appointment.reason ||
                    'Not recorded',

                  address:
                    appointment.patientAddress ||
                    ''
                }
              );
            }
          }
        }


        /*
         * FINAL PATIENT LIST
         */
        this.patients =
          Array.from(
            patientMap.values()
          );


        this.isPatientsLoading =
          false;


        this.cdr.detectChanges();
      },


      error: () => {

        this.isPatientsLoading =
          false;

        this.errorMessage =
          'Unable to load your patients. Please try again.';

        this.cdr.detectChanges();
      }

    });
  }


  /*
   * LOAD APPOINTMENTS
   */
  private loadAppointments(): void {

    if (!this.doctor?.id) {

      return;
    }


    this.isAppointmentsLoading =
      true;

    this.errorMessage =
      '';

    this.cdr.detectChanges();


    this.appointmentService
      .getAppointments()
      .subscribe({

        next: (appointments) => {

          this.appointments =
            (
              appointments ?? []
            ).filter(
              appointment =>
                Number(
                  appointment.doctorId
                ) ===
                Number(
                  this.doctor?.id
                )
            );


          this.isAppointmentsLoading =
            false;


          this.cdr.detectChanges();
        },


        error: () => {

          this.isAppointmentsLoading =
            false;

          this.errorMessage =
            'Unable to load your appointments. Please try again.';

          this.cdr.detectChanges();
        }

      });
  }


  /*
   * ACCEPT / REJECT APPOINTMENT
   */
  updateAppointmentStatus(
    appointment: Appointment,
    status:
      | 'APPROVED'
      | 'REJECTED'
  ): void {

    if (
      appointment.id == null
    ) {

      return;
    }


    if (
      this.updatingAppointmentId !==
      null
    ) {

      return;
    }


    const action =
      status === 'APPROVED'
        ? 'accept'
        : 'reject';


    const patientName =
      appointment.patientName ||
      'this patient';


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this appointment for ${patientName}?`
      );


    if (!confirmed) {

      return;
    }


    this.updatingAppointmentId =
      Number(
        appointment.id
      );


    this.appointmentActionMessage =
      '';

    this.appointmentActionError =
      '';


    this.cdr.detectChanges();


    /*
     * Keep existing appointment update logic
     */
    const request:
      AppointmentRequest = {

      patientId:
        Number(
          appointment.patientId
        ),

      doctorId:
        Number(
          appointment.doctorId
        ),

      appointmentDate:
        appointment.appointmentDate,

      appointmentTime:
        appointment.appointmentTime,

      reason:
        appointment.reason ?? '',

      status:
        status
    };


    this.appointmentService
      .updateAppointment(
        Number(
          appointment.id
        ),
        request
      )
      .subscribe({

        next: (
          updatedAppointment
        ) => {

          this.appointments =
            this.appointments.map(
              item =>
                Number(item.id) ===
                Number(
                  updatedAppointment.id
                )
                  ? updatedAppointment
                  : item
            );


          this.updatingAppointmentId =
            null;


          this.appointmentActionMessage =
            status === 'APPROVED'
              ? 'Appointment confirmed successfully.'
              : 'Appointment rejected successfully.';


          this.appointmentActionError =
            '';


          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'Appointment status update failed:',
            error
          );


          this.updatingAppointmentId =
            null;


          this.appointmentActionMessage =
            '';


          if (
            error?.status === 403
          ) {

            this.appointmentActionError =
              'You are not allowed to update this appointment.';

          } else if (
            error?.status === 401
          ) {

            this.appointmentActionError =
              'Your session has expired. Please login again.';

          } else {

            this.appointmentActionError =
              'Unable to update appointment status. Please try again.';
          }


          this.cdr.detectChanges();
        }

      });
  }


  /*
   * FORMAT STATUS
   */
  formatStatus(
    status: string
  ): string {

    switch (
      status?.toUpperCase()
    ) {

      case 'APPROVED':
        return 'Confirmed';

      case 'REJECTED':
        return 'Rejected';

      case 'PENDING':
        return 'Pending';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:

        return status
          ? status.charAt(0) +
            status.slice(1)
              .toLowerCase()
          : 'Unknown';
    }
  }


  /*
   * PRIME NG STATUS
   */
  getStatusSeverity(
    status: string
  ):
    'success' |
    'info' |
    'warn' |
    'danger' |
    'secondary' {

    switch (
      status?.toUpperCase()
    ) {

      case 'APPROVED':
        return 'success';

      case 'REJECTED':
        return 'danger';

      case 'PENDING':
        return 'warn';

      case 'COMPLETED':
        return 'info';

      case 'CANCELLED':
        return 'danger';

      default:
        return 'secondary';
    }
  }


  /*
   * LOGOUT
   */
  logout(): void {

    this.authService.logout();

    this.router.navigate(
      ['/login']
    );
  }
}