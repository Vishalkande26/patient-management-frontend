import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  RegisterRequest
} from '../../services/auth.service';

@Component({
  selector: 'app-register',

  imports: [
    FormsModule,
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

    if (
      !this.username ||
      !this.email ||
      !this.password
    ) {

      this.message =
        'Please fill all fields';

      return;
    }


    const registerData: RegisterRequest = {

      username: this.username,

      email: this.email,

      password: this.password

    };


    this.authService.register(registerData).subscribe({

      next: (response: string) => {

        console.log(
          'Registration successful:',
          response
        );


        this.message =
          'Registration successful! Please login.';


        this.username = '';

        this.email = '';

        this.password = '';

        this.showPassword = false;


        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1000);

      },


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