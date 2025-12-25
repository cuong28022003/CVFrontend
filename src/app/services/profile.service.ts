import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './auth.service';

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = '/api/profile';

  constructor(private http: HttpClient) { }

  updateProfile(userId: string, data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}`, data);
  }

  getProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`);
  }
}
