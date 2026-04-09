import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.gatewayUrl}/gateway/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.userId ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getFullName(): string {
    return this.currentUserSubject.value?.fullName ?? 'Customer';
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/status`, isActive);
  }

  private storeUser(res: AuthResponse): void {
    localStorage.setItem('auth', JSON.stringify(res));
    this.currentUserSubject.next(res);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  }
}
