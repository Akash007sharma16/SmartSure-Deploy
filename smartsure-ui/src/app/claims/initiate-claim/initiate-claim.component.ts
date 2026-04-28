import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';

@Component({
  selector: 'app-initiate-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="ss-wizard-wrap">
    <div class="ss-wizard">
      <div class="ss-wizard-header">
        <h2 class="ss-wizard-title">File a Claim</h2>
        <p class="ss-wizard-sub">Complete the steps below to submit your insurance claim</p>
      </div>

      <!-- Stepper -->
      <div class="ss-stepper">
        <div class="ss-step" [class.ss-step-active]="step===1" [class.ss-step-done]="step>1">
          <div class="ss-step-circle">{{ step>1?'✓':'1' }}</div>
          <div class="ss-step-label">Select Policy</div>
        </div>
        <div class="ss-step-line" [class.ss-line-done]="step>1"></div>
        <div class="ss-step" [class.ss-step-active]="step===2" [class.ss-step-done]="step>2">
          <div class="ss-step-circle">{{ step>2?'✓':'2' }}</div>
          <div class="ss-step-label">Claim Details</div>
        </div>
        <div class="ss-step-line" [class.ss-line-done]="step>2"></div>
        <div class="ss-step" [class.ss-step-active]="step===3" [class.ss-step-done]="step>3">
          <div class="ss-step-circle">{{ step>3?'✓':'3' }}</div>
          <div class="ss-step-label">Upload Docs</div>
        </div>
        <div class="ss-step-line" [class.ss-line-done]="step>3"></div>
        <div class="ss-step" [class.ss-step-active]="step===4">
          <div class="ss-step-circle">4</div>
          <div class="ss-step-label">Submit</div>
        </div>
      </div>

      <!-- Step 1 -->
      <div *ngIf="step===1">
        <h3 class="ss-step-heading">Select your policy</h3>
        <div *ngIf="policies.length===0" class="ss-empty-inline">
          <p>No active policies found. <a routerLink="/customer/buy-policy">Buy a policy first →</a></p>
        </div>
        <div class="row g-3 mb-4" *ngIf="policies.length>0">
          <div class="col-12" *ngFor="let p of policies">
            <div class="ss-policy-select" [class.ss-ps-active]="selectedPolicyId===p.id" (click)="selectedPolicyId=p.id">
              <div class="ss-ps-radio"></div>
              <div class="ss-ps-icon">🛡️</div>
              <div class="flex-grow-1">
                <div class="ss-ps-num">{{ p.policyNumber }}</div>
                <div class="ss-ps-type">{{ p.policyType }}</div>
              </div>
              <div class="text-end">
                <div class="ss-ps-coverage">{{ p.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</div>
                <span class="ss-badge ss-badge-active">Active</span>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button class="btn btn-primary px-5" [disabled]="!selectedPolicyId" (click)="step=2">Continue →</button>
        </div>
      </div>

      <!-- Step 2 -->
      <div *ngIf="step===2">
        <h3 class="ss-step-heading">Claim details</h3>
        <form [formGroup]="claimForm">
          <div class="mb-3">
            <label class="form-label fw-semibold">Description of Claim</label>
            <textarea formControlName="description" class="form-control" rows="4" placeholder="Describe what happened and why you're filing this claim..."></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Claim Amount (₹)</label>
            <input type="number" formControlName="claimAmount" class="form-control form-control-lg" placeholder="Enter claim amount" />
          </div>
        </form>
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary px-4" (click)="step=1">← Back</button>
          <button class="btn btn-primary px-5" [disabled]="claimForm.invalid" (click)="saveDraft()">Save & Continue →</button>
        </div>
      </div>

      <!-- Step 3 -->
      <div *ngIf="step===3">
        <h3 class="ss-step-heading">Upload supporting documents</h3>
        <div class="ss-upload-zone">
          <div class="ss-uz-icon">📎</div>
          <p class="ss-uz-text">Upload PDF, JPG, PNG, or Word documents</p>
          <input type="file" (change)="onFileSelected($event)" class="form-control" accept=".pdf,.jpg,.png,.doc,.docx" />
        </div>
        <button class="btn btn-outline-primary mt-3" [disabled]="!selectedFile||uploading" (click)="uploadDoc()">
          <span *ngIf="uploading" class="spinner-border spinner-border-sm me-2"></span>
          {{ uploading ? 'Uploading...' : '⬆ Upload Document' }}
        </button>
        <div *ngFor="let d of uploadedDocs" class="ss-doc-uploaded mt-2">
          <span class="text-success">✓</span> {{ d }}
        </div>
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary px-4" (click)="step=2">← Back</button>
          <button class="btn btn-primary px-5" (click)="step=4">Continue →</button>
        </div>
      </div>

      <!-- Step 4 -->
      <div *ngIf="step===4">
        <h3 class="ss-step-heading">Submit your claim</h3>
        <div class="ss-submit-info">
          <div class="ss-si-icon">📋</div>
          <div>
            <div class="ss-si-title">Your claim is ready to submit</div>
            <p class="ss-si-desc">Once submitted, our team will review your claim within 2-3 business days. You can track the status from your dashboard.</p>
          </div>
        </div>
        <div *ngIf="errorMsg" class="alert alert-danger mt-3">⚠️ {{ errorMsg }}</div>
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary px-4" (click)="step=3">← Back</button>
          <button class="btn btn-success px-5" [disabled]="loading" (click)="submitClaim()">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Submitting...' : '✅ Submit Claim' }}
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
    .ss-step-label { font-size:0.68rem; font-weight:600; color:#64748b; white-space:nowrap; }
    .ss-step-active .ss-step-label { color:#2563eb; }
    .ss-step-done .ss-step-label { color:#16a34a; }
    .ss-step-heading { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:1.5rem; }
    .ss-empty-inline { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.5rem; text-align:center; color:#64748b; font-size:0.875rem; a { color:#2563eb; font-weight:600; } }
    .ss-policy-select { display:flex; align-items:center; gap:1rem; background:white; border:2px solid #e2e8f0; border-radius:12px; padding:1.25rem; cursor:pointer; transition:all 0.2s;
      &:hover { border-color:#2563eb; }
    }
    .ss-ps-active { border-color:#2563eb !important; background:#eff6ff; }
    .ss-ps-radio { width:20px; height:20px; border-radius:50%; border:2px solid #e2e8f0; flex-shrink:0; transition:all 0.2s; }
    .ss-ps-active .ss-ps-radio { border-color:#2563eb; background:#2563eb; box-shadow:inset 0 0 0 3px white; }
    .ss-ps-icon { font-size:1.5rem; flex-shrink:0; }
    .ss-ps-num { font-size:0.9rem; font-weight:800; color:#1e3a5f; }
    .ss-ps-type { font-size:0.75rem; color:#64748b; }
    .ss-ps-coverage { font-size:0.9rem; font-weight:700; color:#1e3a5f; }
    .form-control { border:1.5px solid #e2e8f0; border-radius:10px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    .ss-upload-zone { background:#f8fafc; border:2px dashed #e2e8f0; border-radius:12px; padding:2rem; text-align:center; }
    .ss-uz-icon { font-size:2.5rem; margin-bottom:0.75rem; }
    .ss-uz-text { font-size:0.875rem; color:#64748b; margin-bottom:1rem; }
    .ss-doc-uploaded { display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; color:#1e293b; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:0.5rem 0.875rem; }
    .ss-submit-info { display:flex; align-items:flex-start; gap:1rem; background:#f0f7ff; border:1px solid #bfdbfe; border-radius:12px; padding:1.5rem; }
    .ss-si-icon { font-size:2rem; flex-shrink:0; }
    .ss-si-title { font-size:1rem; font-weight:800; color:#1e3a5f; margin-bottom:0.5rem; }
    .ss-si-desc { font-size:0.875rem; color:#64748b; margin:0; line-height:1.6; }
    .ss-badge { display:inline-flex; align-items:center; padding:0.2rem 0.625rem; border-radius:100px; font-size:0.7rem; font-weight:700; }
    .ss-badge-active { background:#d1fae5; color:#065f46; }
  `]
})
export class InitiateClaimComponent implements OnInit {
  step = 1;
  policies: Policy[] = [];
  selectedPolicyId: number | null = null;
  claimId: number | null = null;
  selectedFile: File | null = null;
  uploadedDocs: string[] = [];
  uploading = false;
  loading = false;
  errorMsg = '';
  claimForm: FormGroup;

  constructor(private fb: FormBuilder, private claimService: ClaimService, private policyService: PolicyService, private authService: AuthService, private router: Router) {
    this.claimForm = this.fb.group({ description: ['', Validators.required], claimAmount: [0, [Validators.required, Validators.min(1)]] });
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.policyService.getCustomerPolicies(userId).subscribe(p => this.policies = p.filter(pol => pol.status === 'Active'));
  }

  saveDraft(): void {
    const userId = this.authService.getUserId()!;
    this.claimService.initiateClaim({ customerId: userId, policyId: this.selectedPolicyId!, description: this.claimForm.value.description, claimAmount: this.claimForm.value.claimAmount }).subscribe(claim => { this.claimId = claim.id; this.step = 3; });
  }

  onFileSelected(event: Event): void { const input = event.target as HTMLInputElement; this.selectedFile = input.files?.[0] ?? null; }

  uploadDoc(): void {
    if (!this.selectedFile || !this.claimId) return;
    this.uploading = true;
    this.claimService.uploadDocument(this.claimId, this.selectedFile).subscribe({ next: doc => { this.uploadedDocs.push(doc.fileName); this.selectedFile = null; this.uploading = false; }, error: () => { this.uploading = false; } });
  }

  submitClaim(): void {
    if (!this.claimId) return;
    this.loading = true;
    this.claimService.submitClaim(this.claimId).subscribe({ next: () => { this.loading = false; this.router.navigate(['/claims/track']); }, error: err => { this.loading = false; this.errorMsg = err.error?.message || 'Submit failed.'; } });
  }
}
