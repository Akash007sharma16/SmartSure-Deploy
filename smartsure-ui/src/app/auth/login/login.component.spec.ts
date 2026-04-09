import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('form should be valid with correct email and password', () => {
    component.form.setValue({ email: 'test@test.com', password: 'Pass123!' });
    expect(component.form.valid).toBeTrue();
  });

  it('should call authService.login on submit', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'tok', role: 'Customer', fullName: 'Test', userId: 1 }));
    component.form.setValue({ email: 'test@test.com', password: 'Pass123!' });
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should show error message on login failure', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials.' } })));
    component.form.setValue({ email: 'bad@test.com', password: 'wrong' });
    component.onSubmit();
    expect(component.errorMsg).toBe('Invalid credentials.');
  });
});
