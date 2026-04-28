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
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <span class="auth-brand-icon">🛡️</span>
        <span class="auth-brand-name">SmartSure</span>
      </div>
      <div class="auth-left-content">
        <h1>Insurance made<br><span class="auth-grad">simple & smart</span></h1>
        <p>Manage all your policies and claims from one powerful platform.</p>
        <div class="auth-features">
          <div class="auth-feat"><span class="af-icon">⚡</span><span>Instant policy activation</span></div>
          <div class="auth-feat"><span class="af-icon">📋</span><span>Easy claims filing & tracking</span></div>
          <div class="auth-feat"><span class="af-icon">🔒</span><span>Bank-grade security</span></div>
          <div class="auth-feat"><span class="af-icon">📊</span><span>Real-time dashboard insights</span></div>
        </div>
        <div class="auth-trust">
          <div class="at-item"><strong>1 Cr+</strong><span>Customers</span></div>
          <div class="at-item"><strong>99.2%</strong><span>Claims Settled</span></div>
          <div class="at-item"><strong>4.8★</strong><span>Rating</span></div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <div class="auth-card-header">
          <h2>Welcome back</h2>
          <p>Sign in to your SmartSure account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label fw-semibold">Email address</label>
            <input type="email" formControlName="email" class="form-control form-control-lg"
                   [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                   placeholder="you@example.com" />
            <div class="invalid-feedback">Please enter a valid email.</div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Password</label>
            <input type="password" formControlName="password" class="form-control form-control-lg"
                   [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
                   placeholder="Enter your password" />
            <div class="invalid-feedback">Password is required.</div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember">
              <label class="form-check-label text-muted" for="remember">Remember me</label>
            </div>
            <a href="#" class="text-primary fw-semibold text-decoration-none" style="font-size:0.875rem;">Forgot password?</a>
          </div>

          <div *ngIf="errorMsg" class="alert alert-danger py-2">⚠️ {{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary w-100 btn-lg" [disabled]="form.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-divider"><span>or</span></div>
        <p class="text-center text-muted mb-0" style="font-size:0.9rem;">
          Don't have an account?
          <a routerLink="/auth/register" class="text-primary fw-bold text-decoration-none">Create one free →</a>
        </p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display:flex; min-height:100vh; width:100vw; font-family:'Inter',sans-serif; margin:0; padding:0; }
    .auth-left {
      flex:1; background:linear-gradient(135deg,#0a1628 0%,#1e3a5f 50%,#1d4ed8 100%);
      display:flex; flex-direction:column; padding:2.5rem; color:white; position:relative; overflow:hidden;
    }
    .auth-left::before {
      content:''; position:absolute; top:-30%; right:-20%; width:500px; height:500px;
      background:radial-gradient(circle,rgba(37,99,235,0.2),transparent 70%); pointer-events:none;
    }
    .auth-brand { display:flex; align-items:center; gap:0.625rem; margin-bottom:3rem; }
    .auth-brand-icon { font-size:1.75rem; }
    .auth-brand-name { font-size:1.3rem; font-weight:900; }
    .auth-left-content { flex:1; display:flex; flex-direction:column; justify-content:center; max-width:480px; }
    h1 { font-size:2.5rem; font-weight:900; line-height:1.15; margin-bottom:1rem; }
    .auth-grad { background:linear-gradient(90deg,#60a5fa,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    p { color:rgba(255,255,255,0.75); font-size:1rem; line-height:1.7; margin-bottom:2rem; }
    .auth-features { display:flex; flex-direction:column; gap:0.875rem; margin-bottom:2.5rem; }
    .auth-feat { display:flex; align-items:center; gap:0.875rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:0.75rem 1rem; font-size:0.9rem; }
    .af-icon { font-size:1.1rem; flex-shrink:0; }
    .auth-trust { display:flex; gap:2rem; }
    .at-item { display:flex; flex-direction:column; strong { font-size:1.25rem; font-weight:900; } span { font-size:0.75rem; color:rgba(255,255,255,0.65); } }
    .auth-right { flex:1; display:flex; align-items:center; justify-content:center; padding:2rem; background:#f0f7ff; }
    .auth-card { background:white; border-radius:20px; padding:2.5rem; width:100%; max-width:440px; box-shadow:0 8px 40px rgba(30,58,95,0.12); border:1px solid #e2e8f0; }
    .auth-card-header { margin-bottom:2rem; h2 { font-size:1.75rem; font-weight:900; color:#1e3a5f; margin-bottom:0.375rem; } p { color:#64748b; font-size:0.9rem; margin:0; } }
    .form-control { border:1.5px solid #e2e8f0; border-radius:10px; font-family:inherit; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    .form-label { color:#1e293b; font-size:0.875rem; }
    .auth-divider { text-align:center; margin:1.5rem 0; position:relative; &::before { content:''; position:absolute; top:50%; left:0; right:0; height:1px; background:#e2e8f0; } span { background:white; padding:0 0.75rem; color:#94a3b8; font-size:0.8rem; position:relative; } }
    @media(max-width:768px) { .auth-left { display:none; } .auth-right { background:white; } }
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
    this.loading = true; this.errorMsg = '';
    this.authService.login(this.form.value).subscribe({
      next: res => { this.loading = false; this.router.navigate([res.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard']); },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Login failed. Check your credentials.'; }
    });
  }
}
