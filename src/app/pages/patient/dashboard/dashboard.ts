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
  AuthService
} from '../../../services/auth.service';

import {
  DoctorService
} from '../../../services/doctor.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
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
   *
   * This means when the patient clicks
   * "View Doctors" or "Create Appointment",
   * the doctor list is already available.
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
     *
     * There is intentionally NO loading spinner
     * on the Patient Dashboard.
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
           *
           * The doctor pages will handle the error
           * if the request actually fails.
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