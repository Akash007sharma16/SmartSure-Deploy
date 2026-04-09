import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() should store token and return AuthResponse', () => {
    const mockResponse = { token: 'jwt-token', role: 'Customer', fullName: 'John', userId: 1 };

    service.login({ email: 'john@test.com', password: 'Pass123!' }).subscribe(res => {
      expect(res.token).toBe('jwt-token');
      expect(res.role).toBe('Customer');
    });

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.getToken()).toBe('jwt-token');
    expect(service.getRole()).toBe('Customer');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('register() should store token on success', () => {
    const mockResponse = { token: 'new-token', role: 'Customer', fullName: 'Jane', userId: 2 };

    service.register({ fullName: 'Jane', email: 'jane@test.com', password: 'Pass123!' }).subscribe(res => {
      expect(res.token).toBe('new-token');
    });

    const req = httpMock.expectOne(r => r.url.includes('/gateway/auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('logout() should clear token and user', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'tok', role: 'Customer', fullName: 'X', userId: 1 }));
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('isLoggedIn() should return false when no token stored', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });
});
