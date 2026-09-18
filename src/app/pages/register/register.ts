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
  RegisterRequest
} from '../../services/auth.service';

@Component({
  selector: 'app-register',

  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './register.html',

  styleUrl: './register.css'
})
export class Register {

  private authService = inject(AuthService);

  private router = inject(Router);


  username = '';

  email = '';

  password = '';

  message = '';

  showPassword = false;


  /*
   * Reactive Registration Form
   *
   * This replaces ngModel form handling.
   * Existing registration functionality remains unchanged.
   */
  registerForm = new FormGroup({

    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

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
   * Show / hide password.
   *
   * This is only a UI feature.
   * It does not affect registration logic.
   */
  togglePassword(): void {

    this.showPassword = !this.showPassword;

  }


  /*
   * Existing registration functionality.
   *
   * The backend API and registration
   * request structure remain unchanged.
   */
  register(): void {

    /*
     * Validate Reactive Form
     */
    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      this.message =
        'Please fill all fields';

      return;
    }


    /*
     * Get values from Reactive Form
     */
    const formValue = this.registerForm.getRawValue();

    this.username = formValue.username;

    this.email = formValue.email;

    this.password = formValue.password;


    /*
     * Existing RegisterRequest structure
     * remains unchanged.
     */
    const registerData: RegisterRequest = {

      username: this.username,

      email: this.email,

      password: this.password

    };


    /*
     * Existing AuthService API call
     * remains unchanged.
     */
    this.authService.register(registerData).subscribe({

      next: (response: string) => {

        console.log(
          'Registration successful:',
          response
        );


        this.message =
          'Registration successful! Please login.';


        /*
         * Existing reset behavior
         * remains unchanged.
         */
        this.username = '';

        this.email = '';

        this.password = '';

        this.showPassword = false;


        /*
         * Reset Reactive Form after
         * successful registration.
         */
        this.registerForm.reset({
          username: '',
          email: '',
          password: ''
        });


        /*
         * Existing navigation remains unchanged.
         */
        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1000);

      },


      /*
       * Existing error handling
       * remains unchanged.
       */
      error: (error: any) => {

        console.error(
          'Registration error:',
          error
        );


        this.message =
          error.error || 'Registration failed';

      }

    });

  }

}