import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { authGuard, customerGuard, adminGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Route Guards', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [AuthService]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('authGuard should redirect to login when not logged in', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('customerGuard should block admin users', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'tok', role: 'Admin', fullName: 'Admin', userId: 1 }));
    const navigateSpy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() => customerGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('adminGuard should block customer users', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'tok', role: 'Customer', fullName: 'Cust', userId: 2 }));
    const navigateSpy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('adminGuard should allow admin users', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'tok', role: 'Admin', fullName: 'Admin', userId: 1 }));
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });
});
