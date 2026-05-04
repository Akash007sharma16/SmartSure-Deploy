import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { strictEmailValidator, getErrorMessage } from '../../shared/validators/app.validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading  = false;
  errorMsg = '';
  showPwd  = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, strictEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && (c.touched || c.dirty)); }
  isValid(f: string):   boolean { const c = this.form.get(f); return !!(c?.valid  && (c.touched || c.dirty)); }
  err(f: string):       string  { return getErrorMessage(f, this.form.get(f)?.errors ?? null); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true; this.errorMsg = '';
    this.authService.login(this.form.value).subscribe({
      next: res => { this.loading = false; this.router.navigate([res.role === 'Admin' ? '/admin/dashboard' : '/customer/dashboard']); },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Login failed. Check your credentials.'; }
    });
  }
}
