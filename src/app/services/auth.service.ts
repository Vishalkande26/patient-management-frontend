import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import { environment } from '../../environments/environment';


export interface RegisterRequest {

  username: string;

  email: string;

  password: string;
}


export interface LoginRequest {

  email: string;

  password: string;
}


export interface LoginResponse {

  token: string;

  username: string;

  email: string;

  role: string;

  patientId: number | null;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private http =
    inject(HttpClient);


  private readonly apiUrl =
    `${environment.apiUrl}/api/auth`;


  // ==========================================
  // REGISTER
  // ==========================================

  register(
    data: RegisterRequest
  ): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/register`,
      data,
      {
        responseType: 'text'
      }
    );
  }


  // ==========================================
  // LOGIN
  // ==========================================

  login(
    data: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      data
    );
  }


  // ==========================================
  // SAVE LOGIN DATA
  // ==========================================

  saveLoginData(
    response: LoginResponse
  ): void {

    localStorage.setItem(
      'token',
      response.token
    );

    localStorage.setItem(
      'username',
      response.username
    );

    localStorage.setItem(
      'email',
      response.email
    );

    localStorage.setItem(
      'role',
      response.role
    );


    if (
      response.patientId !== null &&
      response.patientId !== undefined
    ) {

      localStorage.setItem(
        'patientId',
        String(response.patientId)
      );

    } else {

      localStorage.removeItem(
        'patientId'
      );
    }
  }


  // ==========================================
  // TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem(
      'token'
    );
  }


  // ==========================================
  // ROLE
  // ==========================================

  getRole(): string | null {

    return localStorage.getItem(
      'role'
    );
  }


  // ==========================================
  // USERNAME
  // ==========================================

  getUsername(): string | null {

    return localStorage.getItem(
      'username'
    );
  }


  // ==========================================
  // EMAIL
  // ==========================================

  getEmail(): string | null {

    return localStorage.getItem(
      'email'
    );
  }


  // ==========================================
  // PATIENT ID
  // ==========================================

  getPatientId(): number | null {

    const value =
      localStorage.getItem(
        'patientId'
      );


    if (!value) {

      return null;
    }


    const id =
      Number(value);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return null;
    }


    return id;
  }


  // ==========================================
  // LOGIN CHECK
  // ==========================================

  isLoggedIn(): boolean {

    const token =
      this.getToken();


    return (
      token !== null &&
      token.trim().length > 0
    );
  }


  // ==========================================
  // ADMIN CHECK
  // ==========================================

  isAdmin(): boolean {

    return (
      this.getRole() === 'ADMIN' &&
      this.isLoggedIn()
    );
  }


  // ==========================================
  // DOCTOR CHECK
  // ==========================================

  isDoctor(): boolean {

    return (
      this.getRole() === 'DOCTOR' &&
      this.isLoggedIn()
    );
  }


  // ==========================================
  // PATIENT CHECK
  // ==========================================

  isPatient(): boolean {

    return (
      this.getRole() === 'PATIENT' &&
      this.isLoggedIn()
    );
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'username'
    );

    localStorage.removeItem(
      'email'
    );

    localStorage.removeItem(
      'role'
    );

    localStorage.removeItem(
      'patientId'
    );
  }

}