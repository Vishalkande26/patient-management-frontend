import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  ButtonModule
} from 'primeng/button';

import {
  AuthService
} from '../../../services/auth.service';

import {
  DoctorService
} from '../../../services/doctor.service';

@Component({
  selector: 'app-dashboard',

  imports: [
    RouterLink,
    ButtonModule
  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private router = inject(Router);

  private authService = inject(AuthService);

  private doctorService = inject(DoctorService);


  /*
   * Load doctors in the background
   * as soon as the patient dashboard opens.
   */
  ngOnInit(): void {

    this.preloadDoctors();

  }


  private preloadDoctors(): void {

    /*
     * First check if doctors are already cached.
     */
    const cachedDoctors =
      this.doctorService.getCachedDoctors();


    /*
     * If doctors are already available,
     * there is no need to make another request.
     */
    if (cachedDoctors.length > 0) {

      return;

    }


    /*
     * Load doctors silently in the background.
     */
    this.doctorService
      .getDoctors()
      .subscribe({

        next: (doctors) => {

          console.log(
            'Patient doctors preloaded:',
            doctors
          );

        },

        error: (error) => {

          /*
           * Do not show an error on the dashboard.
           */
          console.error(
            'Unable to preload doctors:',
            error
          );

        }

      });

  }


  get username(): string {

    return this.authService.getUsername()
      ?? 'Patient';

  }


  get role(): string {

    return this.authService.getRole()
      ?? 'PATIENT';

  }


  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}