import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockAuthResponse = {
    token: 'test-jwt-token',
    role: 'Customer',
    fullName: 'John Doe',
    userId: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── login() ───────────────────────────────────────────────────────────────

  it('login() should POST to /gateway/auth/login', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: 'Pass123!' });
    req.flush(mockAuthResponse);
  });

  it('login() should store token in localStorage', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    const stored = JSON.parse(localStorage.getItem('auth')!);
    expect(stored.token).toBe(mockAuthResponse.token);
    expect(stored.role).toBe('Customer');
  });

  it('login() should return AuthResponse with token and role', () => {
    let result: any;
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe(r => (result = r));

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    expect(result.token).toBe(mockAuthResponse.token);
    expect(result.role).toBe('Customer');
    expect(result.userId).toBe(1);
  });

  it('login() should make isLoggedIn() return true', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    expect(service.isLoggedIn()).toBe(true);
  });

  // ── logout() ──────────────────────────────────────────────────────────────

  it('logout() should clear localStorage', () => {
    localStorage.setItem('auth', JSON.stringify(mockAuthResponse));
    service.logout();
    expect(localStorage.getItem('auth')).toBeNull();
  });

  it('logout() should navigate to /auth/login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    service.logout();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('logout() should make isLoggedIn() return false', () => {
    service['currentUserSubject'].next(mockAuthResponse);
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
  });

  // ── getToken() ────────────────────────────────────────────────────────────

  it('getToken() should return null when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() should return stored token after login', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    expect(service.getToken()).toBe(mockAuthResponse.token);
  });

  // ── isLoggedIn() ──────────────────────────────────────────────────────────

  it('isLoggedIn() should return false when no token stored', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn() should return true when auth data exists in localStorage', () => {
    localStorage.setItem('auth', JSON.stringify(mockAuthResponse));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.isLoggedIn()).toBe(true);
  });

  // ── getRole() ─────────────────────────────────────────────────────────────

  it('getRole() should return null when not logged in', () => {
    expect(service.getRole()).toBeNull();
  });

  it('getRole() should return Customer role after login', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    expect(service.getRole()).toBe('Customer');
  });

  it('getRole() should return Admin role for admin user', () => {
    const adminResponse = { ...mockAuthResponse, role: 'Admin' };
    service.login({ email: 'admin@test.com', password: 'Admin123!' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(adminResponse);

    expect(service.getRole()).toBe('Admin');
  });

  // ── register() ────────────────────────────────────────────────────────────

  it('register() should POST to /gateway/auth/register', () => {
    service.register({ fullName: 'Jane', email: 'jane@test.com', password: 'Pass123!' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockAuthResponse, fullName: 'Jane', userId: 2 });
  });

  it('register() should store token on success', () => {
    service.register({ fullName: 'Jane', email: 'jane@test.com', password: 'Pass123!' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/register'));
    req.flush({ ...mockAuthResponse, fullName: 'Jane', userId: 2 });

    expect(service.isLoggedIn()).toBe(true);
  });

  // ── getUserId() ───────────────────────────────────────────────────────────

  it('getUserId() should return null when not logged in', () => {
    expect(service.getUserId()).toBeNull();
  });

  it('getUserId() should return userId after login', () => {
    service.login({ email: 'test@test.com', password: 'Pass123!' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    req.flush(mockAuthResponse);

    expect(service.getUserId()).toBe(1);
  });
});
