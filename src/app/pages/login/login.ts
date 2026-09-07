import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  LoginResponse
} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
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

  login(): void {

    if (!this.email || !this.password) {

      this.message =
        'Please enter email and password';

      return;
    }

    const loginData = {

      email: this.email,

      password: this.password

    };

    this.authService.login(loginData).subscribe({

      next: (response: LoginResponse) => {

        console.log(
          'Login successful:',
          response
        );

        this.authService.saveLoginData(response);

        this.message =
          'Login successful!';

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