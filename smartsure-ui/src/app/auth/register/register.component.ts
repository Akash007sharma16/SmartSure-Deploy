import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  strictEmailValidator, nameValidator, strongPasswordValidator, getErrorMessage
} from '../../shared/validators/app.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  loading  = false;
  errorMsg = '';
  showPwd  = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, nameValidator]],
      email:    ['', [Validators.required, strictEmailValidator]],
      password: ['', [Validators.required, strongPasswordValidator]]
      // role is intentionally omitted — backend always assigns "Customer"
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && (c.touched || c.dirty)); }
  isValid(f: string):   boolean { const c = this.form.get(f); return !!(c?.valid  && (c.touched || c.dirty)); }
  err(f: string):       string  { return getErrorMessage(f, this.form.get(f)?.errors ?? null); }
  pwdErr(key: string):  boolean { return !!(this.form.get('password')?.errors?.[key]); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true; this.errorMsg = '';
    this.authService.register(this.form.value).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/customer/dashboard']); },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Registration failed.'; }
    });
  }
}
