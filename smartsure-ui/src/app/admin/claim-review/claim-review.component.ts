import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-claim-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">Claim Review</h2>
        <p class="ss-page-sub">Review and update claim statuses</p>
      </div>
      <span class="badge bg-primary rounded-pill px-3 py-2">{{ claims.length }} claims</span>
    </div>

    <div *ngIf="claims.length === 0" class="ss-empty">
      <div class="ss-empty-icon">📁</div>
      <h3>No claims to review</h3>
      <p>Claims will appear here once customers start filing them.</p>
    </div>

    <div class="ss-split" *ngIf="claims.length > 0">
      <!-- Left list -->
      <div class="ss-split-left">
        <div class="ss-list-header">All Claims</div>
        <div *ngFor="let c of claims" class="ss-list-item"
             [class.ss-list-active]="selectedClaimId===c.id"
             (click)="openReview(c)">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="ss-li-id">Claim #{{ c.id }}</div>
              <div class="ss-li-sub">Customer #{{ c.customerId }}</div>
            </div>
            <span class="ss-badge" [ngClass]="badgeClass(c.status)">{{ c.status }}</span>
          </div>
          <div class="d-flex justify-content-between mt-2">
            <span class="ss-li-amount">{{ c.claimAmount | currency:'INR':'symbol':'1.0-0' }}</span>
            <span class="ss-li-policy">Policy #{{ c.policyId }}</span>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="ss-split-right">
        <div *ngIf="!selectedClaim" class="ss-empty" style="border:none;">
          <div class="ss-empty-icon">👈</div>
          <h3>Select a claim</h3>
          <p>Click on a claim from the list to review it.</p>
        </div>

        <div *ngIf="selectedClaim as c">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 class="ss-detail-title">Claim #{{ c.id }}</h3>
              <p class="ss-detail-sub">Policy #{{ c.policyId }} · Customer #{{ c.customerId }}</p>
            </div>
            <span class="ss-badge" [ngClass]="badgeClass(c.status)">{{ c.status }}</span>
          </div>

          <div class="ss-info-box mb-3">
            <div class="ss-info-label">Claim Details</div>
            <div class="row g-2 mb-2">
              <div class="col-6">
                <div class="ss-info-key">Amount</div>
                <div class="ss-info-val">{{ c.claimAmount | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
              <div class="col-6">
                <div class="ss-info-key">Current Status</div>
                <div class="ss-info-val">{{ c.status }}</div>
              </div>
            </div>
            <div class="ss-info-key">Description</div>
            <p class="ss-info-desc">{{ c.description }}</p>
          </div>

          <!-- Documents -->
          <div *ngIf="selectedClaimDocuments.length > 0" class="mb-3">
            <div class="ss-info-label mb-2">Uploaded Documents</div>
            <div *ngFor="let doc of selectedClaimDocuments" class="ss-doc-item">
              <span>📄</span>
              <div>
                <div class="ss-doc-name">{{ doc.fileName }}</div>
                <div class="ss-doc-meta">{{ doc.fileType }} · {{ doc.uploadedAt | date:'mediumDate' }}</div>
              </div>
            </div>
          </div>
          <p *ngIf="selectedClaimDocuments.length === 0" class="text-muted small mb-3">No documents uploaded for this claim.</p>

          <!-- Review Form -->
          <div class="ss-review-form">
            <div class="ss-info-label mb-3">Update Status</div>
            <form [formGroup]="reviewForm" (ngSubmit)="submitReview(c.id)">
              <div class="mb-3">
                <label class="form-label fw-semibold">New Status</label>
                <select formControlName="status" class="form-select">
                  <option value="UnderReview">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Admin Remarks</label>
                <textarea formControlName="adminRemarks" class="form-control" rows="3"
                          placeholder="Add notes or remarks..."></textarea>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success" [disabled]="reviewForm.invalid">✅ Update Status</button>
                <button type="button" class="btn btn-outline-secondary" (click)="selectedClaimId=null">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .ss-page-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
    .ss-page-title { font-size:1.5rem; font-weight:900; color:#1e3a5f; margin:0 0 0.25rem; }
    .ss-page-sub { font-size:0.85rem; color:#64748b; margin:0; }
    .ss-split { display:grid; grid-template-columns:340px 1fr; gap:1.5rem; align-items:start; }
    .ss-split-left { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; max-height:calc(100vh - 160px); overflow-y:auto; }
    .ss-split-right { background:white; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; }
    .ss-list-header { padding:0.875rem 1rem; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:0.72rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; }
    .ss-list-item { padding:1rem; border-bottom:1px solid #e2e8f0; cursor:pointer; transition:all 0.15s;
      &:hover { background:#f8fafc; }
      &:last-child { border-bottom:none; }
    }
    .ss-list-active { background:#eff6ff !important; border-left:3px solid #2563eb; }
    .ss-li-id { font-size:0.9rem; font-weight:800; color:#1e3a5f; }
    .ss-li-sub { font-size:0.75rem; color:#64748b; margin-top:0.1rem; }
    .ss-li-amount { font-size:0.8rem; color:#475569; font-weight:600; }
    .ss-li-policy { font-size:0.75rem; color:#94a3b8; }
    .ss-detail-title { font-size:1.1rem; font-weight:900; color:#1e3a5f; margin:0 0 0.25rem; }
    .ss-detail-sub { font-size:0.8rem; color:#64748b; margin:0; }
    .ss-info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; }
    .ss-info-label { font-size:0.72rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.75rem; }
    .ss-info-key { font-size:0.75rem; color:#64748b; }
    .ss-info-val { font-size:0.9rem; font-weight:700; color:#1e293b; margin-top:0.15rem; }
    .ss-info-desc { font-size:0.875rem; color:#475569; margin:0.25rem 0 0; }
    .ss-doc-item { display:flex; align-items:center; gap:0.75rem; padding:0.625rem 0.875rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:0.5rem; }
    .ss-doc-name { font-size:0.875rem; font-weight:600; color:#1e293b; }
    .ss-doc-meta { font-size:0.75rem; color:#64748b; }
    .ss-review-form { background:#f0f7ff; border:1px solid #bfdbfe; border-radius:12px; padding:1.25rem; }
    .ss-badge { display:inline-flex; align-items:center; padding:0.3rem 0.875rem; border-radius:100px; font-size:0.72rem; font-weight:700; }
    .ss-badge-draft { background:#f1f5f9; color:#64748b; }
    .ss-badge-submitted { background:#dbeafe; color:#1e40af; }
    .ss-badge-underreview { background:#fef3c7; color:#92400e; }
    .ss-badge-approved { background:#d1fae5; color:#065f46; }
    .ss-badge-rejected { background:#fee2e2; color:#991b1b; }
    .ss-badge-closed { background:#f1f5f9; color:#475569; }
    .ss-empty { text-align:center; padding:4rem 2rem; background:white; border:1px solid #e2e8f0; border-radius:14px; }
    .ss-empty-icon { font-size:3.5rem; margin-bottom:1rem; }
    h3 { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:0.5rem; }
    p { font-size:0.875rem; color:#64748b; margin:0; }
    .form-select, .form-control { border:1.5px solid #e2e8f0; border-radius:10px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    @media(max-width:1024px) { .ss-split { grid-template-columns:1fr; } }
  `]
})
export class ClaimReviewComponent implements OnInit {
  claims: Claim[] = [];
  selectedClaimId: number | null = null;
  selectedClaimDocuments: any[] = [];
  reviewForm: FormGroup;

  // Computed once — no more *ngFor inside the right panel
  get selectedClaim(): Claim | null {
    return this.claims.find(c => c.id === this.selectedClaimId) ?? null;
  }

  // Safe badge class — handles null/undefined status
  badgeClass(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.reviewForm = this.fb.group({ status: ['UnderReview', Validators.required], adminRemarks: [''] });
  }

  ngOnInit(): void {
    this.adminService.getAllClaims().subscribe({
      next: c => this.claims = c,
      error: () => this.claims = []
    });
  }

  openReview(claim: Claim): void {
    this.selectedClaimId = claim.id;
    this.reviewForm.patchValue({ status: claim.status ?? 'UnderReview', adminRemarks: claim.adminRemarks ?? '' });
    this.adminService.getClaimDocuments(claim.id).subscribe({
      next: d => this.selectedClaimDocuments = d ?? [],
      error: () => this.selectedClaimDocuments = []
    });
  }

  submitReview(claimId: number): void {
    this.adminService.updateClaimStatus(claimId, this.reviewForm.value).subscribe({
      next: updated => {
        const idx = this.claims.findIndex(c => c.id === claimId);
        if (idx !== -1) this.claims[idx] = updated;
        this.selectedClaimId = null;
        this.selectedClaimDocuments = [];
      },
      error: () => {}
    });
  }
}
