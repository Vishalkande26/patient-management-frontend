import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { Admin } from './pages/admin/admin';
import { AdminHome } from './pages/admin/home/admin-home';

import { Doctors } from './pages/admin/doctors/doctors';
import { Patients } from './pages/admin/patients/patients';
import { Users } from './pages/admin/users/users';
import { Appointments } from './pages/admin/appointments/appointments';

import { Doctor } from './pages/doctor/doctor';
import { Patient } from './pages/patient/patient';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

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
        component: Appointments
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
    }
  },


  /* =========================
     INVALID URL
     ========================= */

  {
    path: '**',
    redirectTo: 'login'
  }

];