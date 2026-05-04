import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockAuthService: Partial<AuthService>;
  let router: Router;

  const TEST_URL = 'https://localhost:7000/gateway/test';

  beforeEach(() => {
    mockAuthService = {
      getToken: vi.fn(),
      logout: vi.fn(),
      isLoggedIn: vi.fn(),
      getRole: vi.fn(),
      getUserId: vi.fn(),
      getFullName: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  // ── Token present ─────────────────────────────────────────────────────────

  it('should add Authorization: Bearer header when token exists', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('test-jwt-token');

    httpClient.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should set correct Bearer format in Authorization header', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('my.jwt.token');

    httpClient.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer .+/);
    req.flush({});
  });

  // ── No token ──────────────────────────────────────────────────────────────

  it('should NOT add Authorization header when no token', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

    httpClient.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should pass request through unchanged when no token', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

    let response: any;
    httpClient.get(TEST_URL).subscribe(r => (response = r));

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ data: 'ok' });

    expect(response).toEqual({ data: 'ok' });
  });

  // ── 401 response ──────────────────────────────────────────────────────────

  it('should call AuthService.logout() on 401 response', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');

    httpClient.get(TEST_URL).subscribe({ error: () => {} });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should navigate to /auth/login on 401 response', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    httpClient.get(TEST_URL).subscribe({ error: () => {} });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  // ── 403 response ──────────────────────────────────────────────────────────

  it('should navigate to /auth/login on 403 response', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('customer-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    httpClient.get(TEST_URL).subscribe({ error: () => {} });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should NOT call logout() on 403 response', () => {
    (mockAuthService.getToken as ReturnType<typeof vi.fn>).mockReturnValue('customer-token');

    httpClient.get(TEST_URL).subscribe({ error: () => {} });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });
});
