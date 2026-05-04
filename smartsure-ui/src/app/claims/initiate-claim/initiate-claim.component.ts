import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';
import { descriptionValidator, numericRangeValidator, getErrorMessage } from '../../shared/validators/app.validators';

@Component({
  selector: 'app-initiate-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './initiate-claim.component.html',
  styleUrls: ['./initiate-claim.component.css']
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
  successMsg = '';
  claimForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private policyService: PolicyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.claimForm = this.fb.group({
      description: ['', [Validators.required, descriptionValidator(15, 500)]],
      claimAmount: [0,  [Validators.required, numericRangeValidator(1, 10000000)]]
    });
  }

  isInvalid(f: string): boolean { const c = this.claimForm.get(f); return !!(c?.invalid && (c.touched || c.dirty)); }
  isValid(f: string):   boolean { const c = this.claimForm.get(f); return !!(c?.valid  && (c.touched || c.dirty)); }
  err(f: string):       string  { return getErrorMessage(f, this.claimForm.get(f)?.errors ?? null); }

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
    }).subscribe(claim => { this.claimId = claim.id; this.step = 3; });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDoc(): void {
    if (!this.selectedFile || !this.claimId) return;
    this.uploading = true;
    this.claimService.uploadDocument(this.claimId, this.selectedFile).subscribe({
      next: doc => { this.uploadedDocs.push(doc.fileName); this.selectedFile = null; this.uploading = false; },
      error: () => { this.uploading = false; }
    });
  }

  submitClaim(): void {
    if (!this.claimId) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.claimService.submitClaim(this.claimId).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Claim submitted successfully! Redirecting to your claims...';
        setTimeout(() => this.router.navigate(['/claims/track']), 2000);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Submit failed. Please try again.';
      }
    });
  }
}
