import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <!-- Left Panel -->
      <div class="auth-left">
        <div class="auth-logo">
          <div class="logo-icon">🛡️</div>
          <span class="logo-text">SmartSure</span>
        </div>
        <h2>Insurance made simple, smart, and secure.</h2>
        <p>Manage all your policies and claims from one powerful platform.</p>
        <div class="auth-features">
          <div class="feature-item">
            <div class="feature-icon">✅</div>
            <span>Instant policy activation</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📄</div>
            <span>Easy claims filing &amp; tracking</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <span>Bank-grade security</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <span>Real-time dashboard insights</span>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="auth-right">
        <div class="auth-card animate-fade-in-up">
          <h2>Welcome back</h2>
          <p class="auth-subtitle">Sign in to your SmartSure account</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email address</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input type="email" formControlName="email" class="form-control"
                       [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                       placeholder="you@example.com" />
              </div>
              <small *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="error">
                Please enter a valid email address.
              </small>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <span class="input-icon">🔑</span>
                <input type="password" formControlName="password" class="form-control"
                       [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
                       placeholder="Enter your password" />
              </div>
              <small *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="error">
                Password is required.
              </small>
            </div>

            <div class="form-extras">
              <label class="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <div *ngIf="errorMsg" class="alert alert-danger">⚠️ {{ errorMsg }}</div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="form.invalid || loading">
              {{ loading ? '⏳ Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-divider"><span>or</span></div>

          <p>Don't have an account? <a routerLink="/auth/register">Create one free →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #64748b;
      cursor: pointer;
    }
    .checkbox-label input { cursor: pointer; }
    .forgot-link { color: #3b82f6; font-weight: 600; text-decoration: none; }
    .forgot-link:hover { color: #1e40af; }
    .auth-divider {
      text-align: center;
      margin: 1.5rem 0 1rem;
      position: relative;
    }
    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%; left: 0; right: 0;
      height: 1px;
      background: #e2e8f0;
    }
    .auth-divider span {
      background: white;
      padding: 0 0.75rem;
      color: #94a3b8;
      font-size: 0.8rem;
      position: relative;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([res.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Login failed.';
      }
    });
  }
}
