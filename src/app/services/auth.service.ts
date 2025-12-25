import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface User {
  id?: string;
  email: string;
  fullName: string;
  phone?: string;
  location?: string;
  avatar?: string;
  password?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Adjust this to your backend base URL or proxy path
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) { }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      return null;
    }
    // Handle cases where invalid values like 'undefined' or malformed JSON are stored
    try {
      const parsed = JSON.parse(storedUser);
      return parsed && typeof parsed === 'object' ? parsed as User : null;
    } catch {
      // Clean up bad value to prevent repeated failures in other browsers
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  login(email: string, password: string): Observable<User> {
    const payload: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        console.log('Login response:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.user) {
          const serialized = JSON.stringify(res.user);
          // Only persist if serialization succeeds and yields a string
          if (typeof serialized === 'string') {
            localStorage.setItem('currentUser', serialized);
          }
          this.currentUserSubject.next(res.user);
        } else {
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
        }
      }),
      map((res) => res.user)
    );
  }

  register(email: string, fullName: string, password: string): Observable<User> {
    const payload: RegisterRequest = { email, fullName, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.user) {
          const serialized = JSON.stringify(res.user);
          if (typeof serialized === 'string') {
            localStorage.setItem('currentUser', serialized);
          }
          this.currentUserSubject.next(res.user);
        } else {
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
        }
      }),
      map((res) => res.user)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
