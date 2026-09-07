import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { Admin } from './pages/admin/admin';
import { Doctors } from './pages/admin/doctors/doctors';
import { Patients } from './pages/admin/patients/patients';

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

  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: 'admin/doctors',
    component: Doctors,
    canActivate: [authGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: 'admin/patients',
    component: Patients,
    canActivate: [authGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: 'doctor',
    component: Doctor,
    canActivate: [authGuard],
    data: {
      role: 'DOCTOR'
    }
  },

  {
    path: 'patient',
    component: Patient,
    canActivate: [authGuard],
    data: {
      role: 'PATIENT'
    }
  }

];