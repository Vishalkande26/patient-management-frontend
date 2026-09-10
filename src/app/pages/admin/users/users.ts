import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { User, UserService } from '../../../services/user.service';
import { Modal } from '../../../shared/modal/modal';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FormsModule,
    Modal
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  private userService = inject(UserService);


  // =====================================================
  // USER DATA
  // =====================================================

  users: User[] = [];

  filteredUsers: User[] = [];

  paginatedUsers: User[] = [];


  // =====================================================
  // LOADING STATES
  // =====================================================

  loading = false;

  saving = false;

  deleting = false;


  // =====================================================
  // USER FORM
  // =====================================================

  editingId: number | null = null;

  username = '';

  email = '';

  password = '';

  role = 'PATIENT';


  // =====================================================
  // MODALS
  // =====================================================

  showUserModal = false;

  showDeleteModal = false;

  selectedUser: User | null = null;


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


  // =====================================================
  // FILTERS
  // =====================================================

  roleFilter = 'ALL';

  usernameFilter = '';

  emailFilter = '';

  roleColumnFilter = '';


  // =====================================================
  // SORTING
  // =====================================================

  sortColumn:
    | 'id'
    | 'username'
    | 'email'
    | 'role' = 'id';

  sortDirection: 'asc' | 'desc' = 'asc';


  // =====================================================
  // PAGINATION
  // =====================================================

  currentPage = 1;

  pageSize = 5;

  pageSizeOptions = [5, 10, 20, 50];


  // =====================================================
  // ROLES
  // =====================================================

  roles = [
    'PATIENT',
    'DOCTOR',
    'ADMIN'
  ];


  // =====================================================
  // TOAST
  // =====================================================

  showPopup = false;

  popupMessage = '';

  popupType: 'success' | 'error' = 'success';

  private popupTimer: ReturnType<typeof setTimeout> | null = null;


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {
    this.loadUsers();
  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    this.loading = true;

    this.userService.getUsers().subscribe({

      next: (data: User[]) => {

        this.users = data ?? [];

        this.applyFilters();

        this.loading = false;

      },

      error: (error: HttpErrorResponse) => {

        console.error('Error loading users:', error);

        this.loading = false;

        this.showToast(
          this.getErrorMessage(error, 'Failed to load users.'),
          'error'
        );

      }

    });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshUsers(): void {

    this.loadUsers();

  }


  // =====================================================
  // SEARCH
  // =====================================================

  onSearchChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  clearSearch(): void {

    this.searchTerm = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // =====================================================
  // FILTER CHANGE
  // =====================================================

  onFilterChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm.trim().toLowerCase();

    const username =
      this.usernameFilter.trim().toLowerCase();

    const email =
      this.emailFilter.trim().toLowerCase();

    const roleColumn =
      this.roleColumnFilter.trim().toLowerCase();


    this.filteredUsers = this.users.filter(
      (user: User) => {

        const matchesSearch =
          !search ||
          user.username
            .toLowerCase()
            .includes(search) ||
          user.email
            .toLowerCase()
            .includes(search) ||
          user.role
            .toLowerCase()
            .includes(search);


        const matchesRole =
          this.roleFilter === 'ALL' ||
          user.role === this.roleFilter;


        const matchesUsername =
          !username ||
          user.username
            .toLowerCase()
            .includes(username);


        const matchesEmail =
          !email ||
          user.email
            .toLowerCase()
            .includes(email);


        const matchesRoleColumn =
          !roleColumn ||
          user.role
            .toLowerCase()
            .includes(roleColumn);


        return (
          matchesSearch &&
          matchesRole &&
          matchesUsername &&
          matchesEmail &&
          matchesRoleColumn
        );

      }
    );


    this.applySorting();

    this.updatePagination();

  }


  // =====================================================
  // SORTING
  // =====================================================

  sortBy(
    column: 'id' | 'username' | 'email' | 'role'
  ): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }


    this.applySorting();

    this.updatePagination();

  }


  applySorting(): void {

    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;


    this.filteredUsers.sort(
      (a: User, b: User) => {

        let valueA: string | number;

        let valueB: string | number;


        switch (this.sortColumn) {

          case 'id':

            valueA = a.id ?? 0;

            valueB = b.id ?? 0;

            break;


          case 'username':

            valueA = a.username.toLowerCase();

            valueB = b.username.toLowerCase();

            break;


          case 'email':

            valueA = a.email.toLowerCase();

            valueB = b.email.toLowerCase();

            break;


          case 'role':

            valueA = a.role.toLowerCase();

            valueB = b.role.toLowerCase();

            break;

        }


        if (valueA < valueB) {
          return -1 * direction;
        }

        if (valueA > valueB) {
          return 1 * direction;
        }

        return 0;

      }
    );

  }


  getSortIcon(
    column: 'id' | 'username' | 'email' | 'role'
  ): string {

    if (this.sortColumn !== column) {

      return '↕';

    }


    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearAllFilters(): void {

    this.searchTerm = '';

    this.roleFilter = 'ALL';

    this.usernameFilter = '';

    this.emailFilter = '';

    this.roleColumnFilter = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  clearColumnFilters(): void {

    this.usernameFilter = '';

    this.emailFilter = '';

    this.roleColumnFilter = '';

    this.currentPage = 1;

    this.applyFilters();

  }


  // =====================================================
  // ADD USER
  // =====================================================

  openAddUserModal(): void {

    this.clearForm();

    this.editingId = null;

    this.showUserModal = true;

  }


  // =====================================================
  // EDIT USER
  // =====================================================

  openEditUserModal(user: User): void {

    this.editingId = user.id ?? null;

    this.username = user.username;

    this.email = user.email;

    this.role = user.role;

    this.password = '';

    this.showUserModal = true;

  }


  // =====================================================
  // CLOSE USER MODAL
  // =====================================================

  closeUserModal(): void {

    if (this.saving) {
      return;
    }

    this.showUserModal = false;

    this.clearForm();

  }


  // =====================================================
  // SAVE USER
  // =====================================================

  saveUser(): void {

    const trimmedUsername =
      this.username.trim();

    const trimmedEmail =
      this.email.trim();


    if (!trimmedUsername) {

      this.showToast(
        'Username is required.',
        'error'
      );

      return;

    }


    if (!trimmedEmail) {

      this.showToast(
        'Email is required.',
        'error'
      );

      return;

    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(trimmedEmail)) {

      this.showToast(
        'Please enter a valid email address.',
        'error'
      );

      return;

    }


    if (this.editingId === null && !this.password) {

      this.showToast(
        'Password is required.',
        'error'
      );

      return;

    }


    if (this.password &&
        this.password.length < 6) {

      this.showToast(
        'Password must contain at least 6 characters.',
        'error'
      );

      return;

    }


    this.saving = true;


    const request: any = {

      username: trimmedUsername,

      email: trimmedEmail,

      role: this.role

    };


    if (this.password.trim()) {

      request.password =
        this.password.trim();

    }


    // =================================================
    // CREATE
    // =================================================

    if (this.editingId === null) {

      this.userService
        .createUser(request)
        .subscribe({

          next: () => {

            this.saving = false;

            this.showUserModal = false;

            this.clearForm();

            this.loadUsers();

            this.showToast(
              'User created successfully.',
              'success'
            );

          },

          error: (error: HttpErrorResponse) => {

            console.error(
              'Error creating user:',
              error
            );

            this.saving = false;

            this.showToast(
              this.getErrorMessage(
                error,
                'Failed to create user.'
              ),
              'error'
            );

          }

        });

      return;

    }


    // =================================================
    // UPDATE
    // =================================================

    this.userService
      .updateUser(
        this.editingId,
        request
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.showUserModal = false;

          this.clearForm();

          this.loadUsers();

          this.showToast(
            'User updated successfully.',
            'success'
          );

        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Error updating user:',
            error
          );

          this.saving = false;

          this.showToast(
            this.getErrorMessage(
              error,
              'Failed to update user.'
            ),
            'error'
          );

        }

      });

  }


  // =====================================================
  // DELETE MODAL
  // =====================================================

  openDeleteModal(user: User): void {

    this.selectedUser = user;

    this.showDeleteModal = true;

  }


  closeDeleteModal(): void {

    if (this.deleting) {
      return;
    }

    this.showDeleteModal = false;

    this.selectedUser = null;

  }


  // =====================================================
  // DELETE USER
  // =====================================================

  confirmDeleteUser(): void {

    if (!this.selectedUser?.id) {

      this.showToast(
        'User ID is missing.',
        'error'
      );

      return;

    }


    this.deleting = true;


    this.userService
      .deleteUser(this.selectedUser.id)
      .subscribe({

        next: () => {

          this.deleting = false;

          this.showDeleteModal = false;

          this.selectedUser = null;

          this.loadUsers();

          this.showToast(
            'User deleted successfully.',
            'success'
          );

        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Error deleting user:',
            error
          );

          this.deleting = false;

          this.showToast(
            this.getErrorMessage(
              error,
              'Failed to delete user.'
            ),
            'error'
          );

        }

      });

  }


  // =====================================================
  // CLEAR FORM
  // =====================================================

  clearForm(): void {

    this.username = '';

    this.email = '';

    this.password = '';

    this.role = 'PATIENT';

  }


  // =====================================================
  // PAGINATION
  // =====================================================

  updatePagination(): void {

    const totalPages =
      this.totalPages;


    if (
      this.currentPage > totalPages &&
      totalPages > 0
    ) {

      this.currentPage = totalPages;

    }


    const start =
      (this.currentPage - 1) *
      this.pageSize;


    const end =
      start + this.pageSize;


    this.paginatedUsers =
      this.filteredUsers.slice(
        start,
        end
      );

  }


  onPageSizeChange(): void {

    this.currentPage = 1;

    this.updatePagination();

  }


  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();

    }

  }


  goToPage(page: number): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {

      this.currentPage = page;

      this.updatePagination();

    }

  }


  get totalRecords(): number {

    return this.filteredUsers.length;

  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.totalRecords /
        this.pageSize
      )
    );

  }


  get pages(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );

  }


  get startRecord(): number {

    if (this.totalRecords === 0) {
      return 0;
    }


    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;

  }


  get endRecord(): number {

    return Math.min(
      this.currentPage *
      this.pageSize,
      this.totalRecords
    );

  }


  // =====================================================
  // TOAST MESSAGE
  // =====================================================

  showToast(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.popupMessage = message;

    this.popupType = type;

    this.showPopup = true;


    if (this.popupTimer) {

      clearTimeout(
        this.popupTimer
      );

    }


    this.popupTimer =
      setTimeout(() => {

        this.showPopup = false;

      }, 4000);

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    if (
      typeof error.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;

    }


    if (
      error.error?.message &&
      typeof error.error.message === 'string'
    ) {

      return error.error.message;

    }


    if (
      error.error?.error &&
      typeof error.error.error === 'string'
    ) {

      return error.error.error;

    }


    if (
      error.message &&
      error.message.trim()
    ) {

      return error.message;

    }


    return fallback;

  }

}