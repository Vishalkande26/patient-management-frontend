import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/auth';

  register(data: RegisterRequest): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/register`,
      data,
      {
        responseType: 'text'
      }
    );
  }

  login(data: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      data
    );
  }

  saveLoginData(response: LoginResponse): void {

    localStorage.setItem('token', response.token);

    localStorage.setItem('username', response.username);

    localStorage.setItem('email', response.email);

    localStorage.setItem('role', response.role);
  }

  getToken(): string | null {

    return localStorage.getItem('token');
  }

  getRole(): string | null {

    return localStorage.getItem('role');
  }

  getUsername(): string | null {

    return localStorage.getItem('username');
  }

  getEmail(): string | null {

    return localStorage.getItem('email');
  }

  isLoggedIn(): boolean {

    return this.getToken() !== null;
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }
}