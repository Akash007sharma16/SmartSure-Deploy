import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { PolicyType } from '../../core/models/policy.models';
import { numericRangeValidator, dateRangeValidator, getErrorMessage } from '../../shared/validators/app.validators';

@Component({
  selector: 'app-buy-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buy-policy.component.html',
  styleUrls: ['./buy-policy.component.css']
})
export class BuyPolicyComponent implements OnInit {
  step = 1;
  policyTypes: PolicyType[] = [];
  selectedTypeId: number | null = null;
  selectedType: PolicyType | null = null;
  estimatedPremium: number | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  today = new Date().toISOString().split('T')[0];
  detailsForm: FormGroup;

  // Icon map for policy types
  readonly typeIconMap: Record<string, string> = {
    'health':   'fa-solid fa-heart-pulse',
    'life':     'fa-solid fa-shield-halved',
    'vehicle':  'fa-solid fa-car',
    'auto':     'fa-solid fa-car',
    'travel':   'fa-solid fa-plane',
    'home':     'fa-solid fa-house',
    'digital':  'fa-solid fa-laptop',
    'family':   'fa-solid fa-people-roof',
    'lic':      'fa-solid fa-file-shield',
    'bike':     'fa-solid fa-motorcycle',
  };

  getTypeIcon(name: string): string {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(this.typeIconMap)) {
      if (key.includes(k)) return v;
    }
    return 'fa-solid fa-shield-halved';
  }

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.detailsForm = this.fb.group({
      coverageAmount: [500000, [Validators.required, numericRangeValidator(1000, 100000000)]],
      startDate:      ['', Validators.required],
      endDate:        ['', Validators.required]
    }, { validators: dateRangeValidator });
  }

  isInvalid(f: string): boolean { const c = this.detailsForm.get(f); return !!(c?.invalid && (c.touched || c.dirty)); }
  isValid(f: string):   boolean { const c = this.detailsForm.get(f); return !!(c?.valid  && (c.touched || c.dirty)); }
  err(f: string):       string  { return getErrorMessage(f, this.detailsForm.get(f)?.errors ?? null); }
  hasDateError(key: string): boolean { return !!(this.detailsForm.errors?.[key]); }

  ngOnInit(): void {
    this.policyService.getPolicyTypes().subscribe(t => this.policyTypes = t);
  }

  selectType(pt: PolicyType): void {
    this.selectedTypeId = pt.id;
    this.selectedType = pt;
  }

  calculateAndNext(): void {
    if (!this.selectedTypeId) return;
    this.policyService.calculatePremium({
      policyTypeId: this.selectedTypeId,
      coverageAmount: this.detailsForm.value.coverageAmount
    }).subscribe(r => {
      this.estimatedPremium = r.amount;
      this.step = 3;
    });
  }

  confirmPurchase(): void {
    this.loading = true; this.errorMsg = ''; this.successMsg = '';
    const userId = this.authService.getUserId()!;
    this.policyService.buyPolicy({
      customerId: userId,
      policyTypeId: this.selectedTypeId!,
      coverageAmount: this.detailsForm.value.coverageAmount,
      startDate: this.detailsForm.value.startDate,
      endDate: this.detailsForm.value.endDate
    }).subscribe({
      next: policy => {
        this.policyService.activatePolicy(policy.id, userId).subscribe({
          next: activated => {
            this.loading = false;
            this.successMsg = `Policy "${activated.policyType}" activated successfully! Redirecting to your policies...`;
            setTimeout(() => this.router.navigate(['/customer/policies']), 2000);
          },
          error: () => {
            this.loading = false;
            this.successMsg = 'Policy purchased! Redirecting to your policies...';
            setTimeout(() => this.router.navigate(['/customer/policies']), 2000);
          }
        });
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Purchase failed. Please try again.';
      }
    });
  }
}
