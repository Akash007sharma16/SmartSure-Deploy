import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { PolicyType } from '../../core/models/policy.models';

@Component({
  selector: 'app-buy-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="ss-wizard-wrap">
    <div class="ss-wizard">
      <div class="ss-wizard-header">
        <h2 class="ss-wizard-title">Buy Insurance Policy</h2>
        <p class="ss-wizard-sub">Complete the steps below to get covered instantly</p>
      </div>

      <!-- Stepper -->
      <div class="ss-stepper">
        <div class="ss-step" [class.ss-step-active]="step===1" [class.ss-step-done]="step>1">
          <div class="ss-step-circle">{{ step>1 ? '✓' : '1' }}</div>
          <div class="ss-step-label">Select Type</div>
        </div>
        <div class="ss-step-line" [class.ss-line-done]="step>1"></div>
        <div class="ss-step" [class.ss-step-active]="step===2" [class.ss-step-done]="step>2">
          <div class="ss-step-circle">{{ step>2 ? '✓' : '2' }}</div>
          <div class="ss-step-label">Coverage Details</div>
        </div>
        <div class="ss-step-line" [class.ss-line-done]="step>2"></div>
        <div class="ss-step" [class.ss-step-active]="step===3">
          <div class="ss-step-circle">3</div>
          <div class="ss-step-label">Confirm & Pay</div>
        </div>
      </div>

      <!-- Step 1 -->
      <div *ngIf="step===1">
        <h3 class="ss-step-heading">Choose a policy type</h3>
        <div class="ss-policy-grid">
          <div *ngFor="let pt of policyTypes" class="ss-pt-card" [class.ss-pt-selected]="selectedTypeId===pt.id" (click)="selectType(pt)">
            <div class="ss-pt-check">✓</div>
            <div class="ss-pt-icon">🛡️</div>
            <h4>{{ pt.name }}</h4>
            <p>{{ pt.description }}</p>
            <span class="ss-rate-badge">{{ pt.baseRate }}% base rate</span>
          </div>
        </div>
        <div *ngIf="policyTypes.length===0" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2 text-muted">Loading policy types...</p>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-primary px-5" [disabled]="!selectedTypeId" (click)="step=2">Continue →</button>
        </div>
      </div>

      <!-- Step 2 -->
      <div *ngIf="step===2">
        <h3 class="ss-step-heading">Coverage details</h3>
        <form [formGroup]="detailsForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">Coverage Amount (₹)</label>
            <input type="number" formControlName="coverageAmount" class="form-control form-control-lg" placeholder="e.g. 500000" />
          </div>
          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold">Start Date</label>
              <input type="date" formControlName="startDate" class="form-control form-control-lg" />
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">End Date</label>
              <input type="date" formControlName="endDate" class="form-control form-control-lg" />
            </div>
          </div>
          <div *ngIf="estimatedPremium" class="ss-premium-box">
            <div class="ss-pb-label">Estimated Annual Premium</div>
            <div class="ss-pb-amount">{{ estimatedPremium | currency:'INR':'symbol':'1.0-0' }}</div>
            <div class="ss-pb-note">Based on {{ selectedType?.baseRate }}% of your coverage amount</div>
          </div>
        </form>
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary px-4" (click)="step=1">← Back</button>
          <button class="btn btn-primary px-5" [disabled]="detailsForm.invalid" (click)="calculateAndNext()">Calculate & Continue →</button>
        </div>
      </div>

      <!-- Step 3 -->
      <div *ngIf="step===3">
        <h3 class="ss-step-heading">Review & Confirm</h3>
        <div class="ss-summary">
          <div class="ss-summary-row"><span>Policy Type</span><strong>{{ selectedType?.name }}</strong></div>
          <div class="ss-summary-row"><span>Coverage Amount</span><strong>{{ detailsForm.value.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</strong></div>
          <div class="ss-summary-row"><span>Start Date</span><strong>{{ detailsForm.value.startDate | date:'mediumDate' }}</strong></div>
          <div class="ss-summary-row"><span>End Date</span><strong>{{ detailsForm.value.endDate | date:'mediumDate' }}</strong></div>
          <div class="ss-summary-total">
            <span>Total Annual Premium</span>
            <strong class="ss-total-amount">{{ estimatedPremium | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
        </div>
        <div *ngIf="errorMsg" class="alert alert-danger mt-3">⚠️ {{ errorMsg }}</div>
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary px-4" (click)="step=2">← Back</button>
          <button class="btn btn-success px-5" [disabled]="loading" (click)="confirmPurchase()">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Processing...' : '✅ Confirm & Activate' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .ss-wizard-wrap { display:flex; justify-content:center; padding:1rem 0; }
    .ss-wizard { background:white; border:1px solid #e2e8f0; border-radius:20px; padding:2.5rem; width:100%; max-width:700px; box-shadow:0 4px 24px rgba(30,58,95,0.08); }
    .ss-wizard-header { margin-bottom:2rem; }
    .ss-wizard-title { font-size:1.5rem; font-weight:900; color:#1e3a5f; margin:0 0 0.375rem; }
    .ss-wizard-sub { font-size:0.875rem; color:#64748b; margin:0; }
    .ss-stepper { display:flex; align-items:center; margin-bottom:2.5rem; }
    .ss-step { display:flex; flex-direction:column; align-items:center; gap:0.375rem; flex:0 0 auto; }
    .ss-step-line { flex:1; height:2px; background:#e2e8f0; margin:0 0.5rem; margin-bottom:1.25rem; transition:background 0.3s; }
    .ss-line-done { background:#2563eb; }
    .ss-step-circle { width:38px; height:38px; border-radius:50%; background:#f8fafc; border:2px solid #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:700; color:#64748b; transition:all 0.2s; }
    .ss-step-active .ss-step-circle { background:#2563eb; border-color:#2563eb; color:white; box-shadow:0 0 0 4px rgba(37,99,235,0.15); }
    .ss-step-done .ss-step-circle { background:#16a34a; border-color:#16a34a; color:white; }
    .ss-step-label { font-size:0.72rem; font-weight:600; color:#64748b; white-space:nowrap; }
    .ss-step-active .ss-step-label { color:#2563eb; }
    .ss-step-done .ss-step-label { color:#16a34a; }
    .ss-step-heading { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:1.5rem; }
    .ss-policy-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; }
    .ss-pt-card { border:2px solid #e2e8f0; border-radius:14px; padding:1.25rem; cursor:pointer; transition:all 0.2s; position:relative;
      &:hover { border-color:#2563eb; box-shadow:0 4px 16px rgba(37,99,235,0.1); }
      h4 { font-size:0.9rem; font-weight:800; color:#1e3a5f; margin:0.625rem 0 0.25rem; }
      p { font-size:0.75rem; color:#64748b; margin-bottom:0.75rem; line-height:1.5; }
    }
    .ss-pt-selected { border-color:#2563eb !important; background:#eff6ff; box-shadow:0 0 0 3px rgba(37,99,235,0.1) !important; }
    .ss-pt-check { position:absolute; top:0.625rem; right:0.625rem; width:20px; height:20px; background:#2563eb; border-radius:50%; color:white; font-size:0.65rem; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; }
    .ss-pt-selected .ss-pt-check { opacity:1; }
    .ss-pt-icon { font-size:1.75rem; }
    .ss-rate-badge { background:#dbeafe; color:#1e40af; font-size:0.72rem; font-weight:700; padding:0.2rem 0.625rem; border-radius:100px; }
    .form-control { border:1.5px solid #e2e8f0; border-radius:10px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    .ss-premium-box { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:1px solid #bbf7d0; border-radius:12px; padding:1.25rem; margin-top:1rem; text-align:center; }
    .ss-pb-label { font-size:0.75rem; font-weight:700; color:#15803d; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.375rem; }
    .ss-pb-amount { font-size:2rem; font-weight:900; color:#16a34a; line-height:1; }
    .ss-pb-note { font-size:0.75rem; color:#15803d; margin-top:0.375rem; }
    .ss-summary { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
    .ss-summary-row { display:flex; justify-content:space-between; align-items:center; padding:0.875rem 1.25rem; border-bottom:1px solid #e2e8f0; font-size:0.875rem; span { color:#64748b; } strong { color:#1e293b; } }
    .ss-summary-total { display:flex; justify-content:space-between; align-items:center; padding:1.25rem; background:linear-gradient(135deg,rgba(30,58,95,0.04),rgba(37,99,235,0.04)); font-size:0.875rem; font-weight:700; color:#1e3a5f; }
    .ss-total-amount { font-size:1.5rem; color:#2563eb; font-weight:900; }
  `]
})
export class BuyPolicyComponent implements OnInit {
  step = 1;
  policyTypes: PolicyType[] = [];
  selectedTypeId: number | null = null;
  selectedType: PolicyType | null = null;
  estimatedPremium: number | null = null;
  loading = false;
  errorMsg = '';
  detailsForm: FormGroup;

  constructor(private fb: FormBuilder, private policyService: PolicyService, private authService: AuthService, private router: Router) {
    this.detailsForm = this.fb.group({ coverageAmount: [500000, [Validators.required, Validators.min(1000)]], startDate: ['', Validators.required], endDate: ['', Validators.required] });
  }

  ngOnInit(): void { this.policyService.getPolicyTypes().subscribe(t => this.policyTypes = t); }

  selectType(pt: PolicyType): void { this.selectedTypeId = pt.id; this.selectedType = pt; }

  calculateAndNext(): void {
    if (!this.selectedTypeId) return;
    this.policyService.calculatePremium({ policyTypeId: this.selectedTypeId, coverageAmount: this.detailsForm.value.coverageAmount }).subscribe(r => { this.estimatedPremium = r.amount; this.step = 3; });
  }

  confirmPurchase(): void {
    this.loading = true; this.errorMsg = '';
    const userId = this.authService.getUserId()!;
    this.policyService.buyPolicy({ customerId: userId, policyTypeId: this.selectedTypeId!, coverageAmount: this.detailsForm.value.coverageAmount, startDate: this.detailsForm.value.startDate, endDate: this.detailsForm.value.endDate }).subscribe({
      next: policy => {
        this.policyService.activatePolicy(policy.id, userId).subscribe({
          next: () => { this.loading = false; this.router.navigate(['/customer/policies']); },
          error: () => { this.loading = false; this.router.navigate(['/customer/policies']); }
        });
      },
      error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Purchase failed. Please try again.'; }
    });
  }
}
