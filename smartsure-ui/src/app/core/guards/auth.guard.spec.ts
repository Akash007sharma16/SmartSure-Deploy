import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authGuard, customerGuard, adminGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('Route Guards', () => {
  let mockAuthService: Partial<AuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      isLoggedIn: vi.fn(),
      getRole: vi.fn(),
      getToken: vi.fn(),
      logout: vi.fn(),
      getUserId: vi.fn(),
      getFullName: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    router = TestBed.inject(Router);
  });

  // ── authGuard ─────────────────────────────────────────────────────────────

  describe('authGuard', () => {
    it('should return true when user is logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should return false when user is NOT logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      expect(result).toBe(false);
    });

    it('should redirect to /auth/login when not logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should NOT redirect when user is logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  // ── customerGuard ─────────────────────────────────────────────────────────

  describe('customerGuard', () => {
    it('should return true when user is logged in with Customer role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Customer');

      const result = TestBed.runInInjectionContext(() =>
        customerGuard({} as any, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should return false when user has Admin role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Admin');

      const result = TestBed.runInInjectionContext(() =>
        customerGuard({} as any, {} as any)
      );

      expect(result).toBe(false);
    });

    it('should redirect to /auth/login when user has Admin role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Admin');
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => customerGuard({} as any, {} as any));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should return false when user is NOT logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = TestBed.runInInjectionContext(() =>
        customerGuard({} as any, {} as any)
      );

      expect(result).toBe(false);
    });

    it('should redirect to /auth/login when not logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => customerGuard({} as any, {} as any));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  // ── adminGuard ────────────────────────────────────────────────────────────

  describe('adminGuard', () => {
    it('should return true when user is logged in with Admin role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Admin');

      const result = TestBed.runInInjectionContext(() =>
        adminGuard({} as any, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should return false when user has Customer role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Customer');

      const result = TestBed.runInInjectionContext(() =>
        adminGuard({} as any, {} as any)
      );

      expect(result).toBe(false);
    });

    it('should redirect to /auth/login when user has Customer role', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Customer');
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should return false when user is NOT logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = TestBed.runInInjectionContext(() =>
        adminGuard({} as any, {} as any)
      );

      expect(result).toBe(false);
    });

    it('should redirect to /auth/login when not logged in', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should NOT redirect when user is Admin', () => {
      (mockAuthService.isLoggedIn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockAuthService.getRole as ReturnType<typeof vi.fn>).mockReturnValue('Admin');
      const navigateSpy = vi.spyOn(router, 'navigate');

      TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
