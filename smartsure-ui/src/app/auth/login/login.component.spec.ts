import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: Partial<AuthService>;
  let router: Router;

  const validCredentials = { email: 'test@test.com', password: 'Pass123!' };
  const mockCustomerResponse = { token: 'jwt-token', role: 'Customer', fullName: 'Test User', userId: 1 };
  const mockAdminResponse   = { token: 'admin-token', role: 'Admin',    fullName: 'Admin User', userId: 2 };

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
      isLoggedIn: vi.fn(),
      getRole: vi.fn(),
      getToken: vi.fn(),
      getUserId: vi.fn(),
      getFullName: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // ── Component creation ────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise with an invalid form', () => {
    expect(component.form.valid).toBe(false);
  });

  // ── Form validation ───────────────────────────────────────────────────────

  it('form should be invalid when email is empty', () => {
    component.form.setValue({ email: '', password: 'Pass123!' });
    expect(component.form.get('email')?.valid).toBe(false);
    expect(component.form.valid).toBe(false);
  });

  it('form should be invalid when password is empty', () => {
    component.form.setValue({ email: 'test@test.com', password: '' });
    expect(component.form.get('password')?.valid).toBe(false);
    expect(component.form.valid).toBe(false);
  });

  it('form should be invalid when both fields are empty', () => {
    component.form.setValue({ email: '', password: '' });
    expect(component.form.valid).toBe(false);
  });

  it('form should be invalid with malformed email', () => {
    component.form.setValue({ email: 'not-an-email', password: 'Pass123!' });
    expect(component.form.get('email')?.valid).toBe(false);
  });

  it('form should be invalid when password is too short (< 8 chars)', () => {
    component.form.setValue({ email: 'test@test.com', password: 'short' });
    expect(component.form.get('password')?.valid).toBe(false);
  });

  it('form should be valid with correct email and password', () => {
    component.form.setValue(validCredentials);
    expect(component.form.valid).toBe(true);
  });

  // ── onSubmit() ────────────────────────────────────────────────────────────

  it('should NOT call authService.login() when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login() with form values when form is valid', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(of(mockCustomerResponse));
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(mockAuthService.login).toHaveBeenCalledWith(validCredentials);
  });

  it('should navigate to /customer/dashboard on successful Customer login', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(of(mockCustomerResponse));
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/customer/dashboard']);
  });

  it('should navigate to /admin/dashboard on successful Admin login', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(of(mockAdminResponse));
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should set errorMsg on login failure with server message', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials.' } }))
    );
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(component.errorMsg).toBe('Invalid credentials.');
  });

  it('should set fallback errorMsg when error has no message', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => ({}))
    );
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(component.errorMsg).toBeTruthy();
  });

  it('should set loading to false after successful login', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(of(mockCustomerResponse));
    vi.spyOn(router, 'navigate');
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(component.loading).toBe(false);
  });

  it('should set loading to false after failed login', () => {
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => ({ error: { message: 'Error' } }))
    );
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(component.loading).toBe(false);
  });

  it('should clear errorMsg before each submit attempt', () => {
    component.errorMsg = 'Previous error';
    (mockAuthService.login as ReturnType<typeof vi.fn>).mockReturnValue(of(mockCustomerResponse));
    vi.spyOn(router, 'navigate');
    component.form.setValue(validCredentials);
    component.onSubmit();
    expect(component.errorMsg).toBe('');
  });
});
