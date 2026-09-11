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

  /*
   * Frontend-only property.
   *
   * Used while Add/Update is running
   * in the background.
   */
  isSaving?: boolean;
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


  // =====================================================
  // HTTP CLIENT
  // =====================================================

  private http =
    inject(HttpClient);


  // =====================================================
  // API URL
  // =====================================================

  private apiUrl =
    'http://localhost:8080/api/users';


  // =====================================================
  // CACHE KEY
  // =====================================================

  private cacheKey =
    'users';


  // =====================================================
  // HTTP HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');


    return new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });
  }


  // =====================================================
  // GET USERS
  // =====================================================

  getUsers(): Observable<User[]> {

    return this.http.get<User[]>(
      this.apiUrl,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // CREATE USER
  // =====================================================

  createUser(
    user: UserCreateRequest
  ): Observable<User> {

    return this.http.post<User>(
      this.apiUrl,
      user,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // UPDATE USER
  // =====================================================

  updateUser(
    id: number,
    user: UserUpdateRequest
  ): Observable<User> {

    return this.http.put<User>(
      `${this.apiUrl}/${id}`,
      user,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // DELETE USER
  // =====================================================

  deleteUser(
    id: number
  ): Observable<string> {

    return this.http.delete<string>(
      `${this.apiUrl}/${id}`,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // GET CACHED USERS
  // =====================================================

  getCachedUsers(): User[] {

    const data =
      localStorage.getItem(
        this.cacheKey
      );


    /*
     * No cached data.
     */

    if (!data) {

      return [];
    }


    try {

      const users =
        JSON.parse(data);


      /*
       * Make sure the result
       * is actually an array.
       */

      if (
        Array.isArray(users)
      ) {

        return users;
      }


      return [];

    } catch {

      /*
       * Invalid localStorage data.
       */

      return [];
    }
  }


  // =====================================================
  // SET CACHED USERS
  // =====================================================

  setCachedUsers(
    users: User[]
  ): void {

    localStorage.setItem(
      this.cacheKey,
      JSON.stringify(users)
    );
  }


  // =====================================================
  // CLEAR CACHE
  // =====================================================

  clearCache(): void {

    localStorage.removeItem(
      this.cacheKey
    );
  }

}