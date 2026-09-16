import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { Admin } from './pages/admin/admin';
import { AdminHome } from './pages/admin/home/admin-home';

import { Doctors } from './pages/admin/doctors/doctors';
import { Patients } from './pages/admin/patients/patients';
import { Users } from './pages/admin/users/users';
import { Appointments as AdminAppointments }
  from './pages/admin/appointments/appointments';

import { Doctor } from './pages/doctor/doctor';
import { Patient } from './pages/patient/patient';

import { Dashboard }
  from './pages/patient/dashboard/dashboard';

import { PatientDoctors }
  from './pages/patient/patient-doctors/patient-doctors';

import { CreateAppointment }
  from './pages/patient/create-appointment/create-appointment';

import { Appointments }
  from './pages/patient/appointments/appointments';

import { authGuard }
  from './guards/auth-guard';


export const routes: Routes = [

  /* =========================
     DEFAULT
     ========================= */

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  /* =========================
     LOGIN
     ========================= */

  {
    path: 'login',
    component: Login
  },


  /* =========================
     REGISTER
     ========================= */

  {
    path: 'register',
    component: Register
  },


  /* =========================
     ADMIN
     ========================= */

  {
    path: 'admin',

    component: Admin,

    canActivate: [authGuard],

    data: {
      role: 'ADMIN'
    },

    children: [

      {
        path: '',
        component: AdminHome
      },

      {
        path: 'doctors',
        component: Doctors
      },

      {
        path: 'patients',
        component: Patients
      },

      {
        path: 'users',
        component: Users
      },

      {
        path: 'appointments',
        component: AdminAppointments
      }

    ]

  },


  /* =========================
     DOCTOR
     ========================= */

  {
    path: 'doctor',

    component: Doctor,

    canActivate: [authGuard],

    data: {
      role: 'DOCTOR'
    }

  },


  /* =========================
     PATIENT
     ========================= */

  {
    path: 'patient',

    component: Patient,

    canActivate: [authGuard],

    data: {
      role: 'PATIENT'
    },

    children: [

      {
        path: '',
        component: Dashboard
      },

      {
        path: 'doctors',
        component: PatientDoctors
      },

      {
        path: 'create-appointment',
        component: CreateAppointment
      },

      {
        path: 'appointments',
        component: Appointments
      }

    ]

  },


  /* =========================
     INVALID URL
     ========================= */

  {
    path: '**',
    redirectTo: 'login'
  }

];