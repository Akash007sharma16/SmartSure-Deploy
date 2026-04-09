import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
        <h2>Join thousands of protected customers.</h2>
        <p>Create your free account and get covered in minutes.</p>
        <div class="auth-features">
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <span>Get started in under 5 minutes</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💳</div>
            <span>No credit card required</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🛡️</div>
            <span>Multiple policy types available</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <span>Manage everything online</span>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="auth-right">
        <div class="auth-card animate-fade-in-up">
          <h2>Create your account</h2>
          <p class="auth-subtitle">Start protecting what matters most</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input type="text" formControlName="fullName" class="form-control"
                       [class.is-invalid]="form.get('fullName')?.invalid && form.get('fullName')?.touched"
                       placeholder="John Smith" />
              </div>
              <small *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched" class="error">
                Full name is required.
              </small>
            </div>

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
                       placeholder="Minimum 6 characters" />
              </div>
              <small *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="error">
                Password must be at least 6 characters.
              </small>
            </div>

            <div class="form-group">
              <label>Account Type</label>
              <div class="role-toggle">
                <button type="button" class="role-btn" [class.active]="form.get('role')?.value === 'Customer'"
                        (click)="form.get('role')?.setValue('Customer')">
                  👤 Customer
                </button>
                <button type="button" class="role-btn" [class.active]="form.get('role')?.value === 'Admin'"
                        (click)="form.get('role')?.setValue('Admin')">
                  ⚙️ Admin
                </button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="alert alert-danger">⚠️ {{ errorMsg }}</div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="form.invalid || loading">
              {{ loading ? '⏳ Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p>Already have an account? <a routerLink="/auth/login">Sign in →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-toggle {
      display: flex;
      gap: 0;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .role-btn {
      flex: 1;
      padding: 0.625rem 1rem;
      border: none;
      background: #f8fafc;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .role-btn:first-child { border-right: 1px solid #e2e8f0; }
    .role-btn.active {
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      color: white;
    }
    .role-btn:hover:not(.active) { background: #f1f5f9; color: #0f172a; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Customer']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.authService.register(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([res.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Registration failed.';
      }
    });
  }
}
