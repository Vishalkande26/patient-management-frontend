import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth.service';


export const authGuard: CanActivateFn =
  (route, state) => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);


    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const token =
      authService.getToken();

    const role =
      authService.getRole();


    console.log(
      'Auth Guard',
      {
        url: state.url,
        hasToken: !!token,
        role: role
      }
    );


    // ==========================================
    // NO TOKEN
    // ==========================================

    if (
      !token ||
      token.trim().length === 0
    ) {

      console.log(
        'Auth Guard: No token'
      );

      return router.createUrlTree(
        ['/login']
      );
    }


    // ==========================================
    // REQUIRED ROLE
    // ==========================================

    const requiredRole =
      route.data['role'] as
        string | undefined;


    // ==========================================
    // NO ROLE REQUIRED
    // ==========================================

    if (!requiredRole) {

      return true;
    }


    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (
      role !== requiredRole
    ) {

      console.log(
        'Auth Guard: Role denied',
        {
          requiredRole,
          currentRole: role
        }
      );


      // Send user to their own dashboard
      if (role === 'ADMIN') {

        return router.createUrlTree(
          ['/admin']
        );
      }


      if (role === 'DOCTOR') {

        return router.createUrlTree(
          ['/doctor']
        );
      }


      if (role === 'PATIENT') {

        return router.createUrlTree(
          ['/patient']
        );
      }


      return router.createUrlTree(
        ['/login']
      );
    }


    // ==========================================
    // AUTHORIZED
    // ==========================================

    return true;
  };