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
    <div class="wizard-container">
      <h2>Initiate Claim</h2>
      <div class="stepper">
        <div class="step" [class.active]="step === 1" [class.done]="step > 1">1. Select Policy</div>
        <div class="step" [class.active]="step === 2" [class.done]="step > 2">2. Claim Details</div>
        <div class="step" [class.active]="step === 3" [class.done]="step > 3">3. Upload Docs</div>
        <div class="step" [class.active]="step === 4">4. Submit</div>
      </div>

      <!-- Step 1 -->
      <div *ngIf="step === 1">
        <h3>Select Policy</h3>
        <div *ngFor="let p of policies" class="policy-card"
             [class.selected]="selectedPolicyId === p.id" (click)="selectedPolicyId = p.id">
          <strong>{{ p.policyNumber }}</strong> - {{ p.policyType }} ({{ p.status }})
        </div>
        <button class="btn btn-primary" [disabled]="!selectedPolicyId" (click)="step = 2">Next</button>
      </div>

      <!-- Step 2 -->
      <div *ngIf="step === 2">
        <h3>Claim Details</h3>
        <form [formGroup]="claimForm">
          <div class="form-group">
            <label>Description</label>
            <textarea formControlName="description" class="form-control" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>Claim Amount ($)</label>
            <input type="number" formControlName="claimAmount" class="form-control" />
          </div>
        </form>
        <button class="btn btn-secondary" (click)="step = 1">Back</button>
        <button class="btn btn-primary" [disabled]="claimForm.invalid" (click)="saveDraft()">Next</button>
      </div>

      <!-- Step 3 -->
      <div *ngIf="step === 3">
        <h3>Upload Documents</h3>
        <input type="file" (change)="onFileSelected($event)" class="form-control" />
        <button class="btn btn-secondary" (click)="uploadDoc()" [disabled]="!selectedFile || uploading">
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
        <div *ngFor="let d of uploadedDocs" class="doc-item">✓ {{ d }}</div>
        <br/>
        <button class="btn btn-secondary" (click)="step = 2">Back</button>
        <button class="btn btn-primary" (click)="step = 4">Next</button>
      </div>

      <!-- Step 4 -->
      <div *ngIf="step === 4">
        <h3>Submit Claim</h3>
        <p>Your claim is saved as Draft. Click Submit to send for review.</p>
        <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
        <button class="btn btn-secondary" (click)="step = 3">Back</button>
        <button class="btn btn-success" [disabled]="loading" (click)="submitClaim()">
          {{ loading ? 'Submitting...' : 'Submit Claim' }}
        </button>
      </div>
    </div>
  `
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

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private policyService: PolicyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.claimForm = this.fb.group({
      description: ['', Validators.required],
      claimAmount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.policyService.getCustomerPolicies(userId).subscribe(p =>
      this.policies = p.filter(pol => pol.status === 'Active')
    );
  }

  saveDraft(): void {
    const userId = this.authService.getUserId()!;
    this.claimService.initiateClaim({
      customerId: userId,
      policyId: this.selectedPolicyId!,
      description: this.claimForm.value.description,
      claimAmount: this.claimForm.value.claimAmount
    }).subscribe(claim => {
      this.claimId = claim.id;
      this.step = 3;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDoc(): void {
    if (!this.selectedFile || !this.claimId) return;
    this.uploading = true;
    this.claimService.uploadDocument(this.claimId, this.selectedFile).subscribe({
      next: (doc) => {
        this.uploadedDocs.push(doc.fileName);
        this.selectedFile = null;
        this.uploading = false;
      },
      error: () => { this.uploading = false; }
    });
  }

  submitClaim(): void {
    if (!this.claimId) return;
    this.loading = true;
    this.claimService.submitClaim(this.claimId).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/claims/track']); },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.message || 'Submit failed.'; }
    });
  }
}
