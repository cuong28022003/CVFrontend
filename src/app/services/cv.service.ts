import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CreateCVRequest {
  title: string;
  role?: string;
  status?: 'public' | 'private';
}

export interface UpdateCVRequest {
  title?: string;
  role?: string;
  status?: 'public' | 'private';
}

export interface CVDto {
  id: string | number;
  title: string;
  role: string;
  status: 'public' | 'private';
  views: number;
  updatedAt: Date;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CvService {
  // Adjust this to your backend base URL or proxy path
  private baseUrl = '/api/cv';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Get HTTP headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  /**
   * Create a new CV
   * @param request CreateCVRequest with title, role, and status
   * @returns Observable of the created CVDto
   * 
   * Note: Backend extracts email from JWT token in Authorization header
   * and associates the CV with the authenticated user
   */
  createCV(request: CreateCVRequest): Observable<CVDto> {
    return this.http.post<CVDto>(`${this.baseUrl}`, request, { headers: this.getHeaders() });
  }

  /**
   * Get all CVs for the current user
   * @returns Observable of CVDto array
   * 
   * Note: Backend extracts email from JWT token and returns only CVs
   * belonging to the authenticated user
   */
  getCVs(): Observable<CVDto[]> {
    return this.http.get<CVDto[]>(`${this.baseUrl}`, { headers: this.getHeaders() });
  }

  /**
   * Get a single CV by ID
   * @param id CV ID (UUID or number)
   * @returns Observable of CVDto
   * 
   * Note: Backend extracts email from JWT token and verifies the CV
   * belongs to the authenticated user before returning
   */
  getCVById(id: string | number): Observable<CVDto> {
    return this.http.get<CVDto>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Update a CV
   * @param id CV ID (UUID or number)
   * @param request Update CV request
   * @returns Observable of the updated CVDto
   * 
   * Note: Backend extracts email from JWT token in Authorization header
   */
  updateCV(id: string | number, request: UpdateCVRequest): Observable<CVDto> {
    return this.http.put<CVDto>(`${this.baseUrl}/${id}`, request, { headers: this.getHeaders() });
  }

  /**
   * Delete a CV
   * @param id CV ID (UUID or number)
   * @returns Observable of response
   * 
   * Note: Backend extracts email from JWT token and verifies the CV
   * belongs to the authenticated user before deleting
   */
  deleteCV(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
