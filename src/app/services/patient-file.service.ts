import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientFile {
  id: number;
  patientId: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientFileService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/files';


  // ==========================================
  // UPLOAD FILE
  // ==========================================

  uploadFile(
    patientId: number,
    file: File
  ): Observable<PatientFile> {

    const formData = new FormData();

    formData.append(
      'file',
      file
    );

    return this.http.post<PatientFile>(
      `${this.apiUrl}/patient/${patientId}`,
      formData
    );
  }


  // ==========================================
  // GET FILES BY PATIENT
  // ==========================================

  getFilesByPatient(
    patientId: number
  ): Observable<PatientFile[]> {

    return this.http.get<PatientFile[]>(
      `${this.apiUrl}/patient/${patientId}`
    );
  }


  // ==========================================
  // DOWNLOAD FILE
  // ==========================================

  downloadFile(
    id: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/${id}/download`,
      {
        responseType: 'blob'
      }
    );
  }


  // ==========================================
  // REPLACE FILE
  // ==========================================

  replaceFile(
    id: number,
    file: File
  ): Observable<PatientFile> {

    const formData = new FormData();

    formData.append(
      'file',
      file
    );

    return this.http.put<PatientFile>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }


  // ==========================================
  // DELETE FILE
  // ==========================================

  deleteFile(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}