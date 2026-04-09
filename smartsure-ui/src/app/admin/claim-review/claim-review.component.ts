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
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Claim Review</h2>
          <p>Review and update claim statuses</p>
        </div>
        <span class="badge badge-info" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
          {{ claims.length }} claims
        </span>
      </div>

      <div *ngIf="claims.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>No claims to review</h3>
        <p>Claims will appear here once customers start filing them.</p>
      </div>

      <div class="split-layout" *ngIf="claims.length > 0">

        <!-- Left: Claims List -->
        <div class="split-left">
          <div style="padding:1rem; border-bottom:1px solid #e2e8f0; background:#f8fafc;">
            <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">All Claims</div>
          </div>
          <div *ngFor="let c of claims"
               class="claim-list-item"
               [class.selected]="selectedClaimId === c.id"
               (click)="openReview(c)">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <div style="font-weight:700; font-size:0.9rem;">Claim #{{ c.id }}</div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:0.15rem;">Customer #{{ c.customerId }}</div>
              </div>
              <span class="badge badge-{{ c.status.toLowerCase() }}" style="font-size:0.7rem;">{{ c.status }}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:0.5rem;">
              <span style="font-size:0.8rem; color:#475569;">{{ c.claimAmount | currency }}</span>
              <span style="font-size:0.75rem; color:#94a3b8;">Policy #{{ c.policyId }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Review Panel -->
        <div class="split-right">
          <div *ngIf="!selectedClaimId" class="empty-state" style="padding:3rem 1rem;">
            <div class="empty-icon">👈</div>
            <h3>Select a claim</h3>
            <p>Click on a claim from the list to review it.</p>
          </div>

          <div *ngIf="selectedClaimId">
            <ng-container *ngFor="let c of claims">
              <div *ngIf="c.id === selectedClaimId">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                  <div>
                    <h3 style="font-size:1.1rem; font-weight:800;">Claim #{{ c.id }}</h3>
                    <p style="font-size:0.8rem; color:#64748b;">Policy #{{ c.policyId }} · Customer #{{ c.customerId }}</p>
                  </div>
                  <span class="badge badge-{{ c.status.toLowerCase() }}">{{ c.status }}</span>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1rem; margin-bottom:1.25rem;">
                  <div style="font-size:0.7rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">Claim Details</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                    <div>
                      <div style="font-size:0.75rem; color:#64748b;">Amount</div>
                      <div style="font-weight:700;">{{ c.claimAmount | currency }}</div>
                    </div>
                    <div>
                      <div style="font-size:0.75rem; color:#64748b;">Status</div>
                      <div style="font-weight:700;">{{ c.status }}</div>
                    </div>
                  </div>
                  <div style="margin-top:0.75rem;">
                    <div style="font-size:0.75rem; color:#64748b; margin-bottom:0.25rem;">Description</div>
                    <p style="font-size:0.875rem;">{{ c.description }}</p>
                  </div>
                </div>

                <!-- Documents Section -->
                <div *ngIf="selectedClaimDocuments.length > 0" style="margin-bottom:1.25rem;">
                  <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">Uploaded Documents</div>
                  <div *ngFor="let doc of selectedClaimDocuments" class="doc-list-item">
                    <span style="font-size:1rem;">📄</span>
                    <div style="flex:1;">
                      <div style="font-size:0.875rem; font-weight:600;">{{ doc.fileName }}</div>
                      <div style="font-size:0.75rem; color:#64748b;">{{ doc.fileType }} · {{ doc.uploadedAt | date:'mediumDate' }}</div>
                    </div>
                  </div>
                </div>
                <p *ngIf="selectedClaimDocuments.length === 0" style="font-size:0.8rem; color:#94a3b8; margin-bottom:1.25rem;">No documents uploaded for this claim.</p>

                <!-- Review Form -->
                <div class="review-form">
                  <div style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">Update Status</div>
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview(c.id)">
                    <div class="form-group">
                      <label>New Status</label>
                      <select formControlName="status" class="form-control">
                        <option value="UnderReview">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Admin Remarks</label>
                      <textarea formControlName="adminRemarks" class="form-control" rows="3"
                                placeholder="Add notes or remarks..."></textarea>
                    </div>
                    <div style="display:flex; gap:0.75rem;">
                      <button type="submit" class="btn btn-success" [disabled]="reviewForm.invalid">
                        ✅ Update Status
                      </button>
                      <button type="button" class="btn btn-secondary" (click)="selectedClaimId = null">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .claim-list-item {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.15s;
    }
    .claim-list-item:hover { background: #f8fafc; }
    .claim-list-item.selected { background: rgba(30,64,175,0.05); border-left: 3px solid #1e40af; }
    .claim-list-item:last-child { border-bottom: none; }
    .doc-list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
  `]
})
export class ClaimReviewComponent implements OnInit {
  claims: Claim[] = [];
  selectedClaimId: number | null = null;
  selectedClaimDocuments: any[] = [];
  reviewForm: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      status: ['UnderReview', Validators.required],
      adminRemarks: ['']
    });
  }

  ngOnInit(): void {
    this.adminService.getAllClaims().subscribe(c => this.claims = c);
  }

  openReview(claim: Claim): void {
    this.selectedClaimId = claim.id;
    this.reviewForm.patchValue({ status: claim.status, adminRemarks: claim.adminRemarks ?? '' });
    this.adminService.getClaimDocuments(claim.id).subscribe({
      next: docs => this.selectedClaimDocuments = docs,
      error: () => this.selectedClaimDocuments = []
    });
  }

  submitReview(claimId: number): void {
    this.adminService.updateClaimStatus(claimId, this.reviewForm.value).subscribe(updated => {
      const idx = this.claims.findIndex(c => c.id === claimId);
      if (idx !== -1) this.claims[idx] = updated;
      this.selectedClaimId = null;
      this.selectedClaimDocuments = [];
    });
  }
}
