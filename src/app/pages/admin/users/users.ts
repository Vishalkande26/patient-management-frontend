import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import {
  User,
  UserService
} from '../../../services/user.service';

@Component({
  selector: 'app-users',

  imports: [
    FormsModule
  ],

  templateUrl: './users.html',

  styleUrl: './users.css'
})
export class Users implements OnInit {

  private userService =
    inject(UserService);

  users: User[] = [];

  loading = false;

  username = '';

  email = '';

  password = '';

  role = 'PATIENT';

  editingId: number | null = null;

  searchTerm = '';

  roleFilter = 'ALL';

  sortField:
    | 'id'
    | 'username'
    | 'email'
    | 'role' = 'id';

  sortDirection: 'asc' | 'desc' = 'asc';

  showPopup = false;

  popupMessage = '';

  popupType: 'success' | 'error' = 'success';


  roles = [
    'PATIENT',
    'DOCTOR',
    'ADMIN'
  ];


  ngOnInit(): void {

    this.loadUsers();
  }


  get filteredUsers(): User[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    let result =
      this.users.filter(user => {

        const matchesSearch =
          !search ||
          user.username
            .toLowerCase()
            .includes(search) ||
          user.email
            .toLowerCase()
            .includes(search);

        const matchesRole =
          this.roleFilter === 'ALL' ||
          user.role === this.roleFilter;

        return (
          matchesSearch &&
          matchesRole
        );
      });


    result = [...result].sort(
      (a, b) => {

        let first: string | number = '';
        let second: string | number = '';

        if (this.sortField === 'id') {
          first = a.id ?? 0;
          second = b.id ?? 0;
        }

        if (this.sortField === 'username') {
          first = a.username.toLowerCase();
          second = b.username.toLowerCase();
        }

        if (this.sortField === 'email') {
          first = a.email.toLowerCase();
          second = b.email.toLowerCase();
        }

        if (this.sortField === 'role') {
          first = a.role;
          second = b.role;
        }

        const comparison =
          first < second
            ? -1
            : first > second
              ? 1
              : 0;

        return this.sortDirection === 'asc'
          ? comparison
          : -comparison;
      }
    );

    return result;
  }


  sortBy(
    field:
      | 'id'
      | 'username'
      | 'email'
      | 'role'
  ): void {

    if (this.sortField === field) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      return;
    }

    this.sortField = field;

    this.sortDirection = 'asc';
  }


  loadUsers(): void {

    this.loading = true;

    this.userService
      .getUsers()
      .subscribe({

        next: (data: User[]) => {

          this.users = data;

          this.loading = false;
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.loading = false;

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to load users.'
            )
          );
        }
      });
  }


  saveUser(): void {

    if (
      !this.username.trim() ||
      !this.email.trim()
    ) {

      this.showError(
        'Username and email are required.'
      );

      return;
    }


    if (this.editingId === null) {

      if (!this.password.trim()) {

        this.showError(
          'Password is required for a new user.'
        );

        return;
      }


      if (this.password.length < 6) {

        this.showError(
          'Password must contain at least 6 characters.'
        );

        return;
      }


      const request = {

        username:
          this.username.trim(),

        email:
          this.email.trim(),

        password:
          this.password,

        role:
          this.role
      };


      this.userService
        .createUser(request)
        .subscribe({

          next: (response: User) => {

            this.users = [
              ...this.users,
              response
            ];

            this.clearForm();

            this.loadUsers();

            this.showSuccess(
              'User created successfully.'
            );
          },

          error: (error: HttpErrorResponse) => {

            console.error(error);

            this.showError(
              this.getErrorMessage(
                error,
                'Failed to create user.'
              )
            );
          }
        });

      return;
    }


    const request = {

      username:
        this.username.trim(),

      email:
        this.email.trim(),

      role:
        this.role,

      ...(this.password.trim()
        ? { password: this.password }
        : {})
    };


    this.userService
      .updateUser(
        this.editingId,
        request
      )
      .subscribe({

        next: (response: User) => {

          this.users =
            this.users.map(
              item =>
                item.id === response.id
                  ? response
                  : item
            );

          this.clearForm();

          this.loadUsers();

          this.showSuccess(
            'User updated successfully.'
          );
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to update user.'
            )
          );
        }
      });
  }


  editUser(user: User): void {

    this.editingId =
      user.id ?? null;

    this.username =
      user.username;

    this.email =
      user.email;

    this.role =
      user.role;

    this.password = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  deleteUser(
    id: number | undefined
  ): void {

    if (id === undefined) {
      return;
    }

    if (
      !confirm(
        'Are you sure you want to delete this user?'
      )
    ) {
      return;
    }


    this.userService
      .deleteUser(id)
      .subscribe({

        next: () => {

          this.users =
            this.users.filter(
              user =>
                user.id !== id
            );

          this.showSuccess(
            'User deleted successfully.'
          );
        },

        error: (error: HttpErrorResponse) => {

          console.error(error);

          this.showError(
            this.getErrorMessage(
              error,
              'Failed to delete user.'
            )
          );
        }
      });
  }


  clearForm(): void {

    this.username = '';

    this.email = '';

    this.password = '';

    this.role = 'PATIENT';

    this.editingId = null;
  }


  showSuccess(message: string): void {

    this.popupMessage = message;

    this.popupType = 'success';

    this.showPopup = true;

    setTimeout(() => {

      this.showPopup = false;

    }, 2500);
  }


  showError(message: string): void {

    this.popupMessage = message;

    this.popupType = 'error';

    this.showPopup = true;

    setTimeout(() => {

      this.showPopup = false;

    }, 3000);
  }


  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    return error.error?.message
      || error.error?.detail
      || fallback;
  }
}