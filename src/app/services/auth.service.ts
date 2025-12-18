import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface User {
  id?: string;
  email: string;
  fullName: string;
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
    return storedUser ? JSON.parse(storedUser) : null;
  }

  login(email: string, password: string): Observable<User> {
    const payload: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
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
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
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
}
