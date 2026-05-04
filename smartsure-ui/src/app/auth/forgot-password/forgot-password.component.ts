import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { strictEmailValidator, strongPasswordValidator } from '../../shared/validators/app.validators';

type Step = 'email' | 'otp' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  step: Step = 'email';
  loading = false;
  errorMsg = '';
  successMsg = '';
  showPwd = false;

  // Store email across steps
  private verifiedEmail = '';

  emailForm: FormGroup;
  otpForm: FormGroup;
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, strictEmailValidator]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, strongPasswordValidator]]
    });
  }

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────

  onSendOtp(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    const email = this.emailForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.verifiedEmail = email;
        this.step = 'otp';
        this.successMsg = `OTP sent to ${email}. Check your inbox.`;
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  onVerifyOtp(): void {
    this.otpForm.markAllAsTouched();
    if (this.otpForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    this.authService.verifyOtp(this.verifiedEmail, this.otpForm.value.otp).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'reset';
        this.successMsg = 'OTP verified! Set your new password.';
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  // ── Step 3: Reset Password ────────────────────────────────────────────────

  onResetPassword(): void {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    this.authService.resetPassword(
      this.verifiedEmail,
      this.otpForm.value.otp,
      this.resetForm.value.newPassword
    ).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'done';
        this.successMsg = 'Password reset successfully!';
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  pwdErr(key: string): boolean {
    return !!(this.resetForm.get('newPassword')?.errors?.[key]);
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.invalid && (c.touched || c.dirty));
  }
}
