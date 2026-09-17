import {
  Routes
} from '@angular/router';


// ==========================================
// AUTH
// ==========================================

import {
  Login
} from './pages/login/login';

import {
  Register
} from './pages/register/register';


// ==========================================
// ADMIN
// ==========================================

import {
  Admin
} from './pages/admin/admin';

import {
  Patients
} from './pages/admin/patients/patients';

import {
  Doctors
} from './pages/admin/doctors/doctors';

import {
  Users
} from './pages/admin/users/users';

import {
  Appointments as AdminAppointments
} from './pages/admin/appointments/appointments';


// ==========================================
// DOCTOR
// ==========================================

import {
  Doctor
} from './pages/doctor/doctor';


// ==========================================
// PATIENT
// ==========================================

import {
  Patient
} from './pages/patient/patient';

import {
  Dashboard
} from './pages/patient/dashboard/dashboard';

import {
  PatientDoctors
} from './pages/patient/patient-doctors/patient-doctors';

import {
  CreateAppointment
} from './pages/patient/create-appointment/create-appointment';

import {
  Appointments
} from './pages/patient/appointments/appointments';


// ==========================================
// GUARD
// ==========================================

import {
  authGuard
} from './guards/auth-guard';


// ==========================================
// ROUTES
// ==========================================

export const routes: Routes = [

  // ========================================
  // LOGIN
  // ========================================

  {
    path: 'login',

    component: Login
  },


  // ========================================
  // REGISTER
  // ========================================

  {
    path: 'register',

    component: Register
  },


  // ========================================
  // ADMIN
  // ========================================

  {
    path: 'admin',

    component: Admin,

    canActivate: [
      authGuard
    ],

    data: {
      role: 'ADMIN'
    },

    children: [

      // ------------------------------------
      // ADMIN DEFAULT
      // ------------------------------------
      //
      // IMPORTANT:
      // Do NOT redirect to patients.
      //
      // /admin itself is the Admin Dashboard.
      //

      {
        path: '',

        pathMatch: 'full',

        component: Admin
      },


      // ------------------------------------
      // PATIENT MANAGEMENT
      // ------------------------------------

      {
        path: 'patients',

        component: Patients,

        canActivate: [
          authGuard
        ],

        data: {
          role: 'ADMIN'
        }
      },


      // ------------------------------------
      // DOCTOR MANAGEMENT
      // ------------------------------------

      {
        path: 'doctors',

        component: Doctors,

        canActivate: [
          authGuard
        ],

        data: {
          role: 'ADMIN'
        }
      },


      // ------------------------------------
      // USER MANAGEMENT
      // ------------------------------------

      {
        path: 'users',

        component: Users,

        canActivate: [
          authGuard
        ],

        data: {
          role: 'ADMIN'
        }
      },


      // ------------------------------------
      // APPOINTMENT MANAGEMENT
      // ------------------------------------

      {
        path: 'appointments',

        component: AdminAppointments,

        canActivate: [
          authGuard
        ],

        data: {
          role: 'ADMIN'
        }
      }

    ]
  },


  // ========================================
  // DOCTOR
  // ========================================

  {
    path: 'doctor',

    component: Doctor,

    canActivate: [
      authGuard
    ],

    data: {
      role: 'DOCTOR'
    }
  },


  // ========================================
  // DOCTOR DASHBOARD
  // ========================================
  //
  // This allows /doctor/dashboard to safely
  // return to the Doctor dashboard.
  //

  {
    path: 'doctor/dashboard',

    redirectTo: '/doctor',

    pathMatch: 'full'
  },


  // ========================================
  // PATIENT
  // ========================================

  {
    path: 'patient',

    component: Patient,

    canActivate: [
      authGuard
    ],

    data: {
      role: 'PATIENT'
    },

    children: [

      // ------------------------------------
      // PATIENT DASHBOARD
      // ------------------------------------

      {
        path: '',

        pathMatch: 'full',

        component: Dashboard
      },


      // ------------------------------------
      // PATIENT DOCTORS
      // ------------------------------------

      {
        path: 'doctors',

        component: PatientDoctors
      },


      // ------------------------------------
      // CREATE APPOINTMENT
      // ------------------------------------

      {
        path: 'create-appointment',

        component: CreateAppointment
      },


      // ------------------------------------
      // PATIENT APPOINTMENTS
      // ------------------------------------

      {
        path: 'appointments',

        component: Appointments
      }

    ]
  },


  // ========================================
  // DEFAULT
  // ========================================

  {
    path: '',

    redirectTo: '/login',

    pathMatch: 'full'
  },


  // ========================================
  // UNKNOWN URL
  // ========================================

  {
    path: '**',

    redirectTo: '/login'
  }

];