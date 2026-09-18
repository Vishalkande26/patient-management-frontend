import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  User,
  UserService
} from '../../../services/user.service';

import {
  Modal
} from '../../../shared/modal/modal';


@Component({
  selector: 'app-users',

  standalone: true,

  imports: [
    FormsModule,
    ReactiveFormsModule,
    Modal
  ],

  templateUrl: './users.html',

  styleUrl: './users.css'
})
export class Users implements OnInit {

  // =====================================================
  // SERVICE
  // =====================================================

  private userService =
    inject(UserService);


  // =====================================================
  // USER DATA
  // =====================================================

  users: User[] = [];

  filteredUsers: User[] = [];

  paginatedUsers: User[] = [];


  // =====================================================
  // LOADING STATES
  // =====================================================

  /*
   * loading is ONLY for the initial list
   * when there is no cached data.
   */
  loading = false;


  /*
   * saving is used for Add / Update.
   */
  saving = false;


  /*
   * deleting is used for Delete.
   */
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
  // REACTIVE FORM
  // =====================================================

  userForm = new FormGroup({

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
        Validators.minLength(6)
      ]
    }),

    role: new FormControl<string>('PATIENT', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    })

  });


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
    | 'role'
    = 'id';

  sortDirection:
    | 'asc'
    | 'desc'
    = 'asc';


  // =====================================================
  // PAGINATION
  // =====================================================

  currentPage = 1;

  pageSize = 5;

  pageSizeOptions = [
    5,
    10,
    20,
    50
  ];


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

  popupType:
    | 'success'
    | 'error'
    = 'success';

  private popupTimer:
    ReturnType<typeof setTimeout> | null =
    null;


  // =====================================================
  // BACKUP FOR UPDATE
  // =====================================================

  private updatingUserBackup:
    User | undefined;


  // =====================================================
  // BACKUP FOR DELETE
  // =====================================================

  private deletedUserBackup:
    User | undefined;


  // =====================================================
  // TEMPORARY USER
  // =====================================================

  private temporaryUser:
    User | undefined;


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    /*
     * Try cached users first.
     *
     * This makes the page appear immediately.
     */

    const cachedUsers =
      this.userService
        .getCachedUsers();


    this.users =
      cachedUsers ?? [];


    /*
     * Only show full loading when
     * there is no cached data.
     */

    this.loading =
      this.users.length === 0;


    /*
     * Load latest users in background.
     */

    this.loadUsers();
  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    /*
     * Only show loading when
     * there are currently no users.
     */

    if (
      this.users.length === 0
    ) {
      this.loading = true;
    }


    this.userService
      .getUsers()
      .subscribe({

        next: (
          data: User[]
        ) => {

          /*
           * Do not overwrite an optimistic
           * Add / Update / Delete operation.
           */

          if (
            this.saving ||
            this.deleting
          ) {

            this.loading = false;

            return;
          }


          this.users =
            (data ?? []).map(
              (user: User) => ({
                ...user,
                isSaving: false
              })
            );


          /*
           * Save latest users to cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          /*
           * Recalculate UI.
           */

          this.applyFilters();

          this.loading = false;

          this.fixCurrentPage();
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error loading users:',
            error
          );


          this.loading = false;


          /*
           * If cached data exists,
           * keep showing it.
           */

          if (
            this.users.length > 0
          ) {

            this.applyFilters();

            return;
          }


          this.showToast(
            this.getErrorMessage(
              error,
              'Failed to load users.'
            ),
            'error'
          );
        }

      });
  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshUsers(): void {

    /*
     * Manual refresh is allowed to
     * contact the backend.
     */

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
  // COLUMN FILTER CHANGE
  // =====================================================

  onColumnFilterChange(): void {

    this.currentPage = 1;

    this.applyFilters();
  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    const username =
      this.usernameFilter
        .trim()
        .toLowerCase();


    const email =
      this.emailFilter
        .trim()
        .toLowerCase();


    const roleColumn =
      this.roleColumnFilter
        .trim()
        .toLowerCase();


    /*
     * Create a new array instead of modifying
     * the original users array.
     */

    this.filteredUsers =
      this.users.filter(
        (user: User) => {

          const matchesSearch =
            !search ||
            String(
              user.id ?? ''
            )
              .toLowerCase()
              .includes(search) ||
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
            user.role ===
            this.roleFilter;


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
    column:
      | 'id'
      | 'username'
      | 'email'
      | 'role'
  ): void {

    if (
      this.sortColumn === column
    ) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortColumn =
        column;

      this.sortDirection =
        'asc';
    }


    this.applySorting();

    this.updatePagination();
  }


  // =====================================================
  // APPLY SORTING
  // =====================================================

  applySorting(): void {

    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;


    this.filteredUsers =
      [...this.filteredUsers];


    this.filteredUsers.sort(
      (
        a: User,
        b: User
      ) => {

        let valueA:
          string | number;

        let valueB:
          string | number;


        switch (
          this.sortColumn
        ) {

          case 'id':

            valueA =
              a.id ?? 0;

            valueB =
              b.id ?? 0;

            break;


          case 'username':

            valueA =
              a.username
                .toLowerCase();

            valueB =
              b.username
                .toLowerCase();

            break;


          case 'email':

            valueA =
              a.email
                .toLowerCase();

            valueB =
              b.email
                .toLowerCase();

            break;


          case 'role':

            valueA =
              a.role
                .toLowerCase();

            valueB =
              b.role
                .toLowerCase();

            break;
        }


        if (
          valueA < valueB
        ) {
          return -1 * direction;
        }


        if (
          valueA > valueB
        ) {
          return 1 * direction;
        }


        return 0;
      }
    );
  }


  // =====================================================
  // SORT ICON
  // =====================================================

  getSortIcon(
    column:
      | 'id'
      | 'username'
      | 'email'
      | 'role'
  ): string {

    if (
      this.sortColumn !== column
    ) {

      return '↕';
    }


    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';
  }


  // =====================================================
  // CLEAR ALL FILTERS
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


  // =====================================================
  // CLEAR COLUMN FILTERS
  // =====================================================

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

    /*
     * No API call.
     *
     * Modal opens immediately.
     */

    this.clearForm();

    this.editingId = null;

    this.showUserModal = true;
  }


  // =====================================================
  // EDIT USER
  // =====================================================

  openEditUserModal(
    user: User
  ): void {

    /*
     * Do not allow editing while
     * optimistic operation is running.
     */

    if (
      user.isSaving
    ) {
      return;
    }


    if (
      user.id === undefined
    ) {
      return;
    }


    /*
     * Copy current user into form.
     */

    this.editingId =
      user.id;


    this.username =
      user.username;


    this.email =
      user.email;


    this.role =
      user.role;


    /*
     * Empty password means
     * keep existing password.
     */

    this.password = '';


    /*
     * Populate Reactive Form.
     */

    this.userForm.patchValue({

      username:
        user.username,

      email:
        user.email,

      password:
        '',

      role:
        user.role

    });


    /*
     * Reset validation state.
     */

    this.userForm.markAsPristine();

    this.userForm.markAsUntouched();


    /*
     * Modal opens immediately.
     */

    this.showUserModal = true;
  }


  // =====================================================
  // CLOSE USER MODAL
  // =====================================================

  closeUserModal(): void {

    /*
     * Allow the modal to close.
     */

    this.showUserModal = false;

    this.clearForm();
  }


  // =====================================================
  // SAVE USER
  // =====================================================

  saveUser(): void {

    /*
     * Prevent duplicate clicks.
     */

    if (
      this.saving
    ) {
      return;
    }


    // -----------------------------------------------------
    // REACTIVE FORM VALIDATION
    // -----------------------------------------------------

    if (
      this.userForm.invalid
    ) {

      this.userForm.markAllAsTouched();


      const username =
        this.userForm.controls.username;

      const email =
        this.userForm.controls.email;

      const password =
        this.userForm.controls.password;


      if (
        username.hasError('required')
      ) {

        this.showToast(
          'Username is required.',
          'error'
        );

        return;
      }


      if (
        email.hasError('required')
      ) {

        this.showToast(
          'Email is required.',
          'error'
        );

        return;
      }


      if (
        email.hasError('email')
      ) {

        this.showToast(
          'Please enter a valid email address.',
          'error'
        );

        return;
      }


      /*
       * Password is required only during Add.
       */

      if (
        this.editingId === null &&
        password.hasError('required')
      ) {

        this.showToast(
          'Password is required.',
          'error'
        );

        return;
      }


      if (
        password.hasError('minlength')
      ) {

        this.showToast(
          'Password must contain at least 6 characters.',
          'error'
        );

        return;
      }


      return;
    }


    // -----------------------------------------------------
    // GET REACTIVE FORM VALUES
    // -----------------------------------------------------

    const formValue =
      this.userForm.getRawValue();


    const trimmedUsername =
      formValue.username.trim();


    const trimmedEmail =
      formValue.email.trim();


    const trimmedPassword =
      formValue.password.trim();


    // -----------------------------------------------------
    // KEEP EXISTING VALIDATION
    // -----------------------------------------------------

    if (
      !trimmedUsername
    ) {

      this.showToast(
        'Username is required.',
        'error'
      );

      return;
    }


    if (
      !trimmedEmail
    ) {

      this.showToast(
        'Email is required.',
        'error'
      );

      return;
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        trimmedEmail
      )
    ) {

      this.showToast(
        'Please enter a valid email address.',
        'error'
      );

      return;
    }


    /*
     * Password required only during Add.
     */

    if (
      this.editingId === null &&
      !trimmedPassword
    ) {

      this.showToast(
        'Password is required.',
        'error'
      );

      return;
    }


    /*
     * Password validation.
     */

    if (
      trimmedPassword &&
      trimmedPassword.length < 6
    ) {

      this.showToast(
        'Password must contain at least 6 characters.',
        'error'
      );

      return;
    }


    // -----------------------------------------------------
    // KEEP COMPONENT VARIABLES IN SYNC
    // -----------------------------------------------------

    this.username =
      trimmedUsername;

    this.email =
      trimmedEmail;

    this.password =
      trimmedPassword;

    this.role =
      formValue.role;


    // -----------------------------------------------------
    // REQUEST
    // -----------------------------------------------------

    const request: any = {

      username:
        trimmedUsername,

      email:
        trimmedEmail,

      role:
        formValue.role

    };


    /*
     * Password is sent only when
     * user entered one.
     */

    if (
      trimmedPassword
    ) {

      request.password =
        trimmedPassword;
    }


    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    if (
      this.editingId === null
    ) {

      this.createUserOptimistically(
        request
      );

      return;
    }


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    this.updateUserOptimistically(
      this.editingId,
      request
    );
  }


  // =====================================================
  // OPTIMISTIC CREATE
  // =====================================================

  private createUserOptimistically(
    request: any
  ): void {

    if (
      this.saving
    ) {
      return;
    }


    this.saving = true;


    /*
     * Temporary user has NO fake ID.
     */

    const temporaryUser: User = {

      username:
        request.username,

      email:
        request.email,

      role:
        request.role,

      isSaving:
        true

    };


    this.temporaryUser =
      temporaryUser;


    /*
     * Add row immediately.
     */

    this.users = [
      ...this.users,
      temporaryUser
    ];


    /*
     * Recalculate immediately.
     */

    this.applyFilters();


    /*
     * Go to last page.
     */

    this.currentPage =
      this.totalPages;


    this.updatePagination();


    /*
     * Close modal immediately.
     */

    this.closeUserModal();


    /*
     * Backend request runs
     * in the background.
     */

    this.userService
      .createUser(request)
      .subscribe({

        next: (
          createdUser: User
        ) => {

          /*
           * Replace temporary user
           * with actual backend user.
           */

          this.users =
            this.users.map(
              (user: User) => {

                if (
                  user ===
                  temporaryUser
                ) {

                  return {

                    ...createdUser,

                    isSaving:
                      false

                  };
                }


                return user;
              }
            );


          /*
           * Update cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          this.temporaryUser =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.showToast(
            'User created successfully.',
            'success'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error creating user:',
            error
          );


          /*
           * Remove temporary user.
           */

          this.users =
            this.users.filter(
              (user: User) =>
                user !==
                temporaryUser
            );


          /*
           * Update cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          this.temporaryUser =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.showToast(
            this.getErrorMessage(
              error,
              'Failed to create user.'
            ),
            'error'
          );
        }

      });
  }


  // =====================================================
  // OPTIMISTIC UPDATE
  // =====================================================

  private updateUserOptimistically(
    id: number,
    request: any
  ): void {

    if (
      this.saving
    ) {
      return;
    }


    /*
     * Find existing user.
     */

    const existingUser =
      this.users.find(
        (user: User) =>
          user.id === id
      );


    if (
      !existingUser
    ) {

      this.showToast(
        'User not found.',
        'error'
      );

      return;
    }


    /*
     * Backup original user.
     */

    this.updatingUserBackup = {

      id:
        existingUser.id,

      username:
        existingUser.username,

      email:
        existingUser.email,

      role:
        existingUser.role,

      isSaving:
        false

    };


    /*
     * Create optimistic version.
     */

    const updatedUser: User = {

      id:
        existingUser.id,

      username:
        request.username,

      email:
        request.email,

      role:
        request.role,

      isSaving:
        true

    };


    /*
     * Update UI immediately.
     */

    this.users =
      this.users.map(
        (user: User) =>
          user.id === id
            ? updatedUser
            : user
      );


    this.applyFilters();


    /*
     * Close modal immediately.
     */

    this.closeUserModal();


    this.saving = true;


    /*
     * Backend update runs
     * in the background.
     */

    this.userService
      .updateUser(
        id,
        request
      )
      .subscribe({

        next: (
          responseUser: User
        ) => {

          /*
           * Replace optimistic user
           * with backend response.
           */

          this.users =
            this.users.map(
              (user: User) => {

                if (
                  user.id === id
                ) {

                  return {

                    ...responseUser,

                    isSaving:
                      false

                  };
                }


                return user;
              }
            );


          /*
           * Update cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          this.updatingUserBackup =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


          this.showToast(
            'User updated successfully.',
            'success'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error updating user:',
            error
          );


          /*
           * Rollback old user.
           */

          if (
            this.updatingUserBackup
          ) {

            this.users =
              this.users.map(
                (user: User) =>
                  user.id === id
                    ? this.updatingUserBackup!
                    : user
              );
          }


          /*
           * Update cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          this.updatingUserBackup =
            undefined;


          this.saving =
            false;


          this.applyFilters();

          this.fixCurrentPage();


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

  openDeleteModal(
    user: User
  ): void {

    /*
     * Do not delete a temporary
     * or currently saving user.
     */

    if (
      user.isSaving
    ) {
      return;
    }


    if (
      user.id === undefined
    ) {
      return;
    }


    this.selectedUser =
      user;


    /*
     * Modal opens immediately.
     */

    this.showDeleteModal =
      true;
  }


  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  closeDeleteModal(): void {

    /*
     * Close immediately.
     */

    this.showDeleteModal =
      false;


    this.selectedUser =
      null;
  }


  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  confirmDeleteUser(): void {

    if (
      this.deleting
    ) {
      return;
    }


    const user =
      this.selectedUser;


    if (
      !user ||
      user.id === undefined
    ) {

      this.showToast(
        'User ID is missing.',
        'error'
      );

      return;
    }


    const id =
      user.id;


    /*
     * Backup user before
     * optimistic deletion.
     */

    this.deletedUserBackup = {

      id:
        user.id,

      username:
        user.username,

      email:
        user.email,

      role:
        user.role,

      isSaving:
        false

    };


    /*
     * Close modal immediately.
     */

    this.showDeleteModal =
      false;


    this.selectedUser =
      null;


    /*
     * Remove user immediately.
     */

    this.users =
      this.users.filter(
        (item: User) =>
          item.id !== id
      );


    /*
     * Update UI immediately.
     */

    this.applyFilters();

    this.fixCurrentPage();


    /*
     * Update cache immediately.
     */

    this.userService
      .setCachedUsers(
        this.users
      );


    this.deleting = true;


    /*
     * Backend DELETE runs
     * in the background.
     */

    this.userService
      .deleteUser(id)
      .subscribe({

        next: () => {

          this.deletedUserBackup =
            undefined;


          this.deleting =
            false;


          /*
           * IMPORTANT:
           *
           * Do NOT call loadUsers().
           */

          this.showToast(
            'User deleted successfully.',
            'success'
          );
        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error deleting user:',
            error
          );


          /*
           * Rollback deleted user.
           */

          if (
            this.deletedUserBackup
          ) {

            this.users = [
              ...this.users,
              this.deletedUserBackup
            ];
          }


          /*
           * Update cache.
           */

          this.userService
            .setCachedUsers(
              this.users
            );


          this.deletedUserBackup =
            undefined;


          this.deleting =
            false;


          this.applyFilters();

          this.fixCurrentPage();


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

    this.editingId = null;


    /*
     * Reset Reactive Form.
     */

    this.userForm.reset({

      username: '',

      email: '',

      password: '',

      role: 'PATIENT'

    });


    /*
     * Reset validation state.
     */

    this.userForm.markAsPristine();

    this.userForm.markAsUntouched();
  }


  // =====================================================
  // PAGINATION
  // =====================================================

  updatePagination(): void {

    const totalPages =
      this.totalPages;


    if (
      this.currentPage >
      totalPages
    ) {

      this.currentPage =
        totalPages;
    }


    if (
      this.currentPage < 1
    ) {

      this.currentPage = 1;
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


  // =====================================================
  // PAGE SIZE CHANGE
  // =====================================================

  onPageSizeChange(
    event?: Event
  ): void {

    /*
     * Supports:
     *
     * (change)="onPageSizeChange($event)"
     *
     * and:
     *
     * (change)="onPageSizeChange()"
     */

    if (event) {

      const target =
        event.target as HTMLSelectElement;


      const newSize =
        Number(
          target.value
        );


      if (
        Number.isFinite(newSize) &&
        newSize > 0
      ) {

        this.pageSize =
          newSize;
      }
    }


    /*
     * Start from page 1
     * after changing page size.
     */

    this.currentPage = 1;

    this.updatePagination();
  }


  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;

      this.updatePagination();
    }
  }


  // =====================================================
  // NEXT PAGE
  // =====================================================

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();
    }
  }


  // =====================================================
  // GO TO PAGE
  // =====================================================

  goToPage(
    page: number
  ): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {

      this.currentPage =
        page;

      this.updatePagination();
    }
  }


  // =====================================================
  // TOTAL RECORDS
  // =====================================================

  get totalRecords(): number {

    return this.filteredUsers.length;
  }


  // =====================================================
  // TOTAL PAGES
  // =====================================================

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.totalRecords /
        this.pageSize
      )
    );
  }


  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  get pages(): number[] {

    return Array.from(
      {
        length:
          this.totalPages
      },
      (
        _,
        index
      ) =>
        index + 1
    );
  }


  // =====================================================
  // START RECORD
  // =====================================================

  get startRecord(): number {

    if (
      this.totalRecords === 0
    ) {

      return 0;
    }


    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }


  // =====================================================
  // END RECORD
  // =====================================================

  get endRecord(): number {

    return Math.min(
      this.currentPage *
        this.pageSize,
      this.totalRecords
    );
  }


  // =====================================================
  // FIX CURRENT PAGE
  // =====================================================

  private fixCurrentPage(): void {

    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;
    }


    if (
      this.currentPage < 1
    ) {

      this.currentPage = 1;
    }


    this.updatePagination();
  }


  // =====================================================
  // TOAST MESSAGE
  // =====================================================

  showToast(
    message: string,
    type:
      | 'success'
      | 'error'
  ): void {

    this.popupMessage =
      message;


    this.popupType =
      type;


    this.showPopup =
      true;


    /*
     * Clear previous timer.
     */

    if (
      this.popupTimer
    ) {

      clearTimeout(
        this.popupTimer
      );
    }


    this.popupTimer =
      setTimeout(() => {

        this.showPopup =
          false;

      }, 4000);
  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    /*
     * Backend returned a plain string.
     */

    if (
      typeof error.error ===
        'string' &&
      error.error.trim()
    ) {

      return error.error;
    }


    /*
     * Backend returned:
     *
     * { message: "..." }
     */

    if (
      error.error?.message &&
      typeof error.error.message ===
        'string'
    ) {

      return error.error.message;
    }


    /*
     * Backend returned:
     *
     * { error: "..." }
     */

    if (
      error.error?.error &&
      typeof error.error.error ===
        'string'
    ) {

      return error.error.error;
    }


    /*
     * Angular HTTP error.
     */

    if (
      error.message &&
      error.message.trim()
    ) {

      return error.message;
    }


    return fallback;
  }

}