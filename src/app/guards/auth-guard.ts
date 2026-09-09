import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  const router = inject(Router);

  if (!authService.isLoggedIn()) {

    router.navigate(['/login']);

    return false;
  }

  const userRole = authService.getRole();

  const requiredRole = route.data['role'];

  if (userRole === requiredRole) {

    return true;
  }

  if (userRole === 'ADMIN') {

    router.navigate(['/admin']);

  } else if (userRole === 'DOCTOR') {

    router.navigate(['/doctor']);

  } else if (userRole === 'PATIENT') {

    router.navigate(['/patient']);

  } else {

    router.navigate(['/login']);
  }

  return false;
};