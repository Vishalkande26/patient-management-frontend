import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface User {

  id?: number;

  username: string;

  email: string;

  role: string;
}

export interface UserCreateRequest {

  username: string;

  email: string;

  password: string;

  role: string;
}

export interface UserUpdateRequest {

  username: string;

  email: string;

  password?: string;

  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http =
    inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/users';


  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  getUsers(): Observable<User[]> {

    return this.http.get<User[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }


  createUser(
    user: UserCreateRequest
  ): Observable<User> {

    return this.http.post<User>(
      this.apiUrl,
      user,
      {
        headers: this.getHeaders()
      }
    );
  }


  updateUser(
    id: number,
    user: UserUpdateRequest
  ): Observable<User> {

    return this.http.put<User>(
      `${this.apiUrl}/${id}`,
      user,
      {
        headers: this.getHeaders()
      }
    );
  }


  deleteUser(
    id: number
  ): Observable<string> {

    return this.http.delete<string>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}