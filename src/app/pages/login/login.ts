import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  LoginResponse
} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);

  private router = inject(Router);

  email = '';

  password = '';

  message = '';

  showPassword = false;


  /*
   * Reactive Login Form
   *
   * This only replaces the form handling.
   * Authentication logic remains unchanged.
   */
  loginForm = new FormGroup({

    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })

  });


  /*
   * Show / hide password
   *
   * This only changes the UI.
   * It does not change the authentication logic.
   */
  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }


  /*
   * Existing login functionality
   *
   * Backend API, JWT handling and role-based
   * navigation remain unchanged.
   */
  login(): void {

    /*
     * Reactive Form validation
     */
    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      this.message =
        'Please enter email and password';

      return;
    }


    /*
     * Get values from Reactive Form
     */
    const formValue = this.loginForm.getRawValue();

    this.email = formValue.email;

    this.password = formValue.password;


    const loginData = {

      email: this.email,

      password: this.password

    };


    /*
     * Existing AuthService call remains unchanged
     */
    this.authService.login(loginData).subscribe({

      next: (response: LoginResponse) => {

        console.log(
          'Login successful:',
          response
        );

        this.authService.saveLoginData(response);

        this.message =
          'Login successful!';


        /*
         * Existing role-based navigation
         * remains unchanged.
         */
        if (response.role === 'ADMIN') {

          this.router.navigate(['/admin']);

        } else if (response.role === 'DOCTOR') {

          this.router.navigate(['/doctor']);

        } else if (response.role === 'PATIENT') {

          this.router.navigate(['/patient']);

        } else {

          this.message =
            'Invalid user role';

        }

      },


      /*
       * Existing error handling remains unchanged.
       */
      error: (error: any) => {

        console.error(
          'Login error:',
          error
        );


        if (error.status === 401) {

          this.message =
            'Invalid email or password';

        } else if (error.status === 403) {

          this.message =
            'Access denied';

        } else {

          this.message =
            'Login failed. Please try again.';

        }

      }

    });

  }

}