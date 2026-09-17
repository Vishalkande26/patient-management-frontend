import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  PatientFile,
  PatientFileService
} from '../../../services/patient-file.service';

import {
  AuthService
} from '../../../services/auth.service';


@Component({
  selector: 'app-files',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './files.html',

  styleUrl: './files.css'
})
export class Files implements OnInit {


  // ==========================================
  // SERVICES
  // ==========================================

  private patientFileService =
    inject(PatientFileService);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  // ==========================================
  // VARIABLES
  // ==========================================

  files: PatientFile[] = [];

  patientId: number | null = null;

  selectedFile: File | null = null;

  isLoading = false;

  isRefreshing = false;

  isUploading = false;

  replacingFileId: number | null = null;

  deletingFileId: number | null = null;

  private nextTemporaryFileId = -1;

  message = '';

  errorMessage = '';

  searchText = '';

  filteredFiles: PatientFile[] = [];


  get messageType(): 'success' | 'error' {

    return this.errorMessage ? 'error' : 'success';
  }


  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    console.log(
      'Patient Files page loaded'
    );

    this.patientId =
      this.authService.getPatientId();

    console.log(
      'Logged-in patient ID:',
      this.patientId
    );


    if (this.patientId === null) {

      this.errorMessage =
        'Patient information not found. Please login again.';

      return;
    }


    this.loadFiles();
  }


  // ==========================================
  // LOAD FILES
  // ==========================================

  loadFiles(): void {

    if (this.patientId === null) {
      return;
    }


    // Keep an existing list on screen while it refreshes. A full loading
    // screen is only needed when the page has no data to show yet.
    const hasFilesToDisplay = this.files.length > 0;

    this.isLoading = !hasFilesToDisplay;

    this.isRefreshing = hasFilesToDisplay;

    this.message = '';

    this.errorMessage = '';


    console.log(
      'Loading files for patient:',
      this.patientId
    );


    this.patientFileService
      .getFilesByPatient(this.patientId)
      .subscribe({

        next: (data: PatientFile[]) => {

          console.log(
            'Patient files:',
            data
          );


          this.files = data ?? [];

          this.filteredFiles =
            [...this.files];

          this.isLoading = false;

          this.isRefreshing = false;


          if (this.files.length === 0) {

            this.message =
              'No files uploaded yet.';
          }
        },


        error: (error: any) => {

          console.error(
            'Error loading patient files:',
            error
          );


          this.isLoading = false;

          this.isRefreshing = false;


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You are not allowed to view these files.';

          } else if (error.status === 404) {

            this.errorMessage =
              'File API not found.';

          } else {

            this.errorMessage =
              'Unable to load files. Please try again.';
          }
        }
      });
  }


  // ==========================================
  // SELECT FILE
  // ==========================================

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedFile = null;

      return;
    }


    this.selectedFile =
      input.files[0];


    console.log(
      'Selected file:',
      this.selectedFile.name
    );


    this.message = '';

    this.errorMessage = '';
  }


  removeSelectedFile(): void {

    this.selectedFile = null;

    this.message = '';

    this.errorMessage = '';
  }


  // ==========================================
  // UPLOAD FILE
  // ==========================================

  uploadFile(): void {

    if (this.patientId === null) {

      this.errorMessage =
        'Patient information not found.';

      return;
    }


    if (!this.selectedFile) {

      this.errorMessage =
        'Please select a file first.';

      return;
    }


    const fileToUpload = this.selectedFile;

    const temporaryFile: PatientFile = {
      id: this.nextTemporaryFileId--,
      patientId: this.patientId,
      originalFileName: fileToUpload.name,
      contentType: fileToUpload.type || 'Unknown',
      fileSize: fileToUpload.size,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add a temporary row before the network request completes so the
    // patient sees the upload immediately.
    this.files = [
      temporaryFile,
      ...this.files
    ];

    this.filteredFiles = [
      ...this.files
    ];

    this.selectedFile = null;

    this.isUploading = true;

    this.message = '';

    this.errorMessage = '';


    console.log(
      'Uploading file:',
      fileToUpload.name
    );


    this.patientFileService
      .uploadFile(
        this.patientId,
        fileToUpload
      )
      .subscribe({

        next: (response: PatientFile) => {

          console.log(
            'File uploaded successfully:',
            response
          );


          this.message =
            'File uploaded successfully.';

          // Replace the temporary upload row with the server record.
          this.files = this.files.map(
            currentFile =>
              currentFile.id === temporaryFile.id
                ? response
                : currentFile
          );

          this.filteredFiles = [
            ...this.files
          ];
          this.isUploading = false;


        },


        error: (error: any) => {

          console.error(
            'File upload error:',
            error
          );


          this.isUploading = false;

          // The request failed, so remove the optimistic temporary row.
          this.files = this.files.filter(
            currentFile => currentFile.id !== temporaryFile.id
          );

          this.filteredFiles = [
            ...this.files
          ];


          if (error.status === 400) {

            this.errorMessage =
              this.getErrorMessage(
                error,
                'Invalid file. Please check the file type and size.'
              );

          } else if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You are not allowed to upload files.';

          } else {

            this.errorMessage =
              this.getErrorMessage(
                error,
                'File upload failed. Please try again.'
              );
          }
        }
      });
  }


  // ==========================================
  // DOWNLOAD FILE
  // ==========================================

  downloadFile(
    file: PatientFile
  ): void {

    console.log(
      'Downloading file:',
      file.id
    );


    this.message = '';

    this.errorMessage = '';


    this.patientFileService
      .downloadFile(file.id)
      .subscribe({

        next: (blob: Blob) => {

          console.log(
            'File downloaded successfully.'
          );


          const url =
            window.URL.createObjectURL(blob);


          const anchor =
            document.createElement('a');


          anchor.href = url;

          anchor.download =
            file.originalFileName;


          document.body.appendChild(
            anchor
          );


          anchor.click();


          document.body.removeChild(
            anchor
          );


          window.URL.revokeObjectURL(
            url
          );


          this.message =
            'File downloaded successfully.';
        },


        error: (error: any) => {

          console.error(
            'File download error:',
            error
          );


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You are not allowed to download this file.';

          } else if (error.status === 404) {

            this.errorMessage =
              'File not found.';

          } else {

            this.errorMessage =
              'File download failed. Please try again.';
          }
        }
      });
  }


  // ==========================================
  // REPLACE FILE
  // ==========================================

  replaceFile(
    file: PatientFile
  ): void {

    const input =
      document.createElement('input');


    input.type = 'file';


    input.onchange = () => {

      if (
        !input.files ||
        input.files.length === 0
      ) {

        return;
      }


      const newFile =
        input.files[0];


      console.log(
        'Replacing file:',
        file.id,
        'with:',
        newFile.name
      );


      this.patientFileService
        .replaceFile(
          file.id,
          newFile
        )
        .subscribe({

          next: (response: PatientFile) => {

            console.log(
              'File replaced successfully:',
              response
            );


            this.message =
              'File replaced successfully.';


            this.errorMessage = '';


            this.loadFiles();
          },


          error: (error: any) => {

            console.error(
              'File replace error:',
              error
            );


            if (error.status === 400) {

              this.errorMessage =
                this.getErrorMessage(
                  error,
                  'Invalid file. Please check the file type and size.'
                );

            } else if (error.status === 401) {

              this.errorMessage =
                'Your session has expired. Please login again.';

            } else if (error.status === 403) {

              this.errorMessage =
                'You are not allowed to replace this file.';

            } else if (error.status === 404) {

              this.errorMessage =
                'File not found.';

            } else {

              this.errorMessage =
                'File replacement failed. Please try again.';
            }
          }
        });
    };


    input.click();
  }


  openReplaceInput(
    input: HTMLInputElement
  ): void {

    input.click();
  }


  onReplaceFileSelected(
    event: Event,
    file: PatientFile
  ): void {

    const input = event.target as HTMLInputElement;

    const replacement = input.files?.[0];

    if (!replacement) {
      return;
    }

    this.message = '';

    this.errorMessage = '';

    this.replacingFileId = file.id;

    this.patientFileService
      .replaceFile(file.id, replacement)
      .subscribe({
        next: (updatedFile: PatientFile) => {
          this.message = 'File replaced successfully.';

          this.files = this.files.map(
            currentFile =>
              currentFile.id === file.id
                ? updatedFile
                : currentFile
          );

          this.filteredFiles = [
            ...this.files
          ];

          this.replacingFileId = null;

          input.value = '';

        },
        error: (error: any) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'File replacement failed. Please try again.'
          );

          this.replacingFileId = null;

          input.value = '';
        }
      });
  }


  // ==========================================
  // DELETE FILE
  // ==========================================

  deleteFile(
    file: PatientFile
  ): void {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${file.originalFileName}"?`
      );


    if (!confirmed) {
      return;
    }


    console.log(
      'Deleting file:',
      file.id
    );


    this.message = '';

    this.errorMessage = '';

    this.deletingFileId = file.id;

    const deletedIndex = this.files.findIndex(
      currentFile => currentFile.id === file.id
    );

    // Remove the row immediately. It will be restored if the API rejects
    // the delete request.
    this.files = this.files.filter(
      currentFile => currentFile.id !== file.id
    );

    this.filteredFiles = [
      ...this.files
    ];


    this.patientFileService
      .deleteFile(file.id)
      .subscribe({

        next: () => {

          console.log(
            'File deleted successfully.'
          );


          this.message =
            'File deleted successfully.';

          this.deletingFileId = null;


        },


        error: (error: any) => {

          console.error(
            'File delete error:',
            error
          );

          this.deletingFileId = null;

          // Restore the removed row when deletion did not succeed.
          const restoreAt = Math.max(0, deletedIndex);

          this.files = [
            ...this.files.slice(0, restoreAt),
            file,
            ...this.files.slice(restoreAt)
          ];

          this.filteredFiles = [
            ...this.files
          ];


          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 403) {

            this.errorMessage =
              'You are not allowed to delete this file.';

          } else if (error.status === 404) {

            this.errorMessage =
              'File not found.';

          } else {

            this.errorMessage =
              'File deletion failed. Please try again.';
          }
        }
      });
  }


  // ==========================================
  // SEARCH FILES
  // ==========================================

  searchFiles(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredFiles =
        [...this.files];

      return;
    }


    this.filteredFiles =
      this.files.filter(
        file => {

          const fileName =
            (
              file.originalFileName || ''
            ).toLowerCase();


          const contentType =
            (
              file.contentType || ''
            ).toLowerCase();


          return (
            fileName.includes(search) ||
            contentType.includes(search)
          );
        }
      );
  }


  // ==========================================
  // REFRESH
  // ==========================================

  refreshFiles(): void {

    this.loadFiles();
  }


  // ==========================================
  // GO BACK
  // ==========================================

  goBack(): void {

    this.router.navigate(
      ['/patient']
    );
  }


  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  formatFileSize(
    bytes: number
  ): string {

    if (!bytes || bytes <= 0) {

      return '0 Bytes';
    }


    const units = [
      'Bytes',
      'KB',
      'MB',
      'GB'
    ];


    const index =
      Math.floor(
        Math.log(bytes) /
        Math.log(1024)
      );


    const size =
      bytes /
      Math.pow(
        1024,
        index
      );


    return (
      size.toFixed(
        index === 0 ? 0 : 2
      ) +
      ' ' +
      units[index]
    );
  }


  formatDate(
    value: string
  ): string {

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 'Unknown'
      : date.toLocaleString();
  }


  isTemporaryFile(
    file: PatientFile
  ): boolean {

    return file.id < 0;
  }


  // ==========================================
  // ERROR MESSAGE HELPER
  // ==========================================

  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;
    }


    if (
      typeof error?.error === 'string'
    ) {

      return error.error;
    }


    return defaultMessage;
  }
}
