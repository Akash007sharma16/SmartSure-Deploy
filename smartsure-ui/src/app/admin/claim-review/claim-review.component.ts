import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-claim-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claim-review.component.html',
  styleUrls: ['./claim-review.component.css']
})
export class ClaimReviewComponent implements OnInit {
  claims: Claim[] = [];
  selectedClaimId: number | null = null;
  selectedClaimDocuments: any[] = [];
  reviewForm: FormGroup;
  updateError = '';
  updateSuccess = '';

  // Valid next statuses based on current status
  private readonly transitions: Record<string, string[]> = {
    'Draft':       ['Submitted'],
    'Submitted':   ['UnderReview'],
    'UnderReview': ['Approved', 'Rejected'],
    'Approved':    ['Closed'],
    'Rejected':    ['Closed'],
    'Closed':      []
  };

  get selectedClaim(): Claim | null {
    return this.claims.find(c => c.id === this.selectedClaimId) ?? null;
  }

  /** Returns only the valid next statuses for the currently selected claim */
  get availableStatuses(): string[] {
    const current = this.selectedClaim?.status ?? '';
    return this.transitions[current] ?? [];
  }

  badgeClass(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  constructor(private adminService: AdminService, private fb: FormBuilder, private route: ActivatedRoute) {
    this.reviewForm = this.fb.group({ status: ['', Validators.required], adminRemarks: [''] });
  }

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.adminService.getAllClaims().subscribe({
      next: c => {
        this.claims = c;
        // Auto-select claim from query param (e.g. from dashboard Review button)
        const claimIdParam = this.route.snapshot.queryParamMap.get('claimId');
        if (claimIdParam && !this.selectedClaimId) {
          const targetId = parseInt(claimIdParam, 10);
          const targetClaim = c.find(claim => claim.id === targetId);
          if (targetClaim) {
            this.openReview(targetClaim);
          }
        }
      },
      error: () => this.claims = []
    });
  }

  openReview(claim: Claim): void {
    this.selectedClaimId = claim.id;
    this.updateError = '';
    this.updateSuccess = '';

    // Fetch fresh claim data from server to avoid stale status
    this.adminService.getAllClaims().subscribe({
      next: freshClaims => {
        this.claims = freshClaims;
        const freshClaim = freshClaims.find(c => c.id === claim.id);
        if (!freshClaim) return;

        // Pre-select the first valid next status based on FRESH status
        const validNext = this.transitions[freshClaim.status ?? ''] ?? [];
        this.reviewForm.patchValue({
          status: validNext[0] ?? '',
          adminRemarks: freshClaim.adminRemarks ?? ''
        });
      },
      error: () => {
        // Fallback to passed claim data
        const validNext = this.transitions[claim.status ?? ''] ?? [];
        this.reviewForm.patchValue({
          status: validNext[0] ?? '',
          adminRemarks: claim.adminRemarks ?? ''
        });
      }
    });

    this.adminService.getClaimDocuments(claim.id).subscribe({
      next: d => this.selectedClaimDocuments = d ?? [],
      error: () => this.selectedClaimDocuments = []
    });
  }

  submitReview(claimId: number): void {
    if (this.reviewForm.invalid) return;

    const newStatus = this.reviewForm.value.status as string;
    const isDestructive = newStatus === 'Approved' || newStatus === 'Rejected' || newStatus === 'Closed';

    if (isDestructive) {
      if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this claim? This action cannot be undone.`)) return;
    }

    this.updateError = '';
    this.updateSuccess = '';

    this.adminService.updateClaimStatus(claimId, this.reviewForm.value).subscribe({
      next: _updated => {
        // Reload all claims from server to get fresh data
        this.loadClaims();
        this.updateSuccess = `Status updated to "${newStatus}" successfully.`;
        // Close panel after short delay
        setTimeout(() => {
          this.selectedClaimId = null;
          this.selectedClaimDocuments = [];
          this.updateSuccess = '';
        }, 1500);
      },
      error: err => {
        // Reload claims to sync UI with actual DB state
        this.loadClaims();
        this.updateError = err?.error?.message
          || `Cannot update status. "${newStatus}" may not be a valid transition from the current status.`;
      }
    });
  }
}
