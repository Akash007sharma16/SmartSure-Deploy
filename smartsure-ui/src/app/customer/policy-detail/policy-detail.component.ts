import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container" *ngIf="policy">
      <!-- Page Header with Back Button -->
      <div class="page-header">
        <div class="page-title">
          <h2>Policy Details</h2>
          <p>Policy #{{ policy.policyNumber }}</p>
        </div>
        <a routerLink="/customer/policies" class="btn btn-secondary">← Back to Policies</a>
      </div>

      <!-- Detail Card -->
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Policy Number</span>
          <strong class="detail-value">{{ policy.policyNumber }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Policy Type</span>
          <strong class="detail-value">{{ policy.policyType }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Coverage Amount</span>
          <strong class="detail-value">{{ policy.coverageAmount | currency }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Premium Amount</span>
          <strong class="detail-value" style="color:#1e40af; font-size:1.1rem;">{{ policy.premiumAmount | currency }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Start Date</span>
          <strong class="detail-value">{{ policy.startDate | date:'mediumDate' }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">End Date</span>
          <strong class="detail-value">{{ policy.endDate | date:'mediumDate' }}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="badge badge-{{ policy.status.toLowerCase() }}">{{ policy.status }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Created</span>
          <strong class="detail-value">{{ policy.createdAt | date:'medium' }}</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="detail-actions" *ngIf="policy.status === 'Draft'">
        <button class="btn btn-success" [disabled]="activating" (click)="activatePolicy()">
          {{ activating ? '⏳ Activating...' : '✅ Activate Policy' }}
        </button>
      </div>
      <div class="detail-actions" *ngIf="policy.status === 'Active'">
        <a routerLink="/claims/initiate" class="btn btn-warning">📝 File a Claim</a>
        <a [routerLink]="['/customer/upload-documents', 0]" class="btn btn-secondary">📎 Upload Documents</a>
      </div>

      <!-- Payment History -->
      <div class="payment-section" *ngIf="policy.status === 'Active' || policy.status === 'Expired'">
        <div class="page-header" style="margin-top:1.5rem;">
          <div class="page-title">
            <h2>Payment History</h2>
            <p>Premium payment records for this policy</p>
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-row">
            <span class="detail-label">Payment Status</span>
            <span class="badge badge-active">Completed</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid</span>
            <strong class="detail-value" style="color:#059669;">{{ policy.premiumAmount | currency }}</strong>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method</span>
            <strong class="detail-value">Online Payment</strong>
          </div>
          <div class="detail-row">
            <span class="detail-label">Policy Activated On</span>
            <strong class="detail-value">{{ policy.createdAt | date:'mediumDate' }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!policy && !loading" class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>Policy not found</h3>
      <p>The policy you're looking for doesn't exist or you don't have access.</p>
      <br>
      <a routerLink="/customer/policies" class="btn btn-secondary">← Back to Policies</a>
    </div>
  `,
  styles: [`
    .detail-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .detail-value { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .detail-actions { display: flex; gap: 1rem; }
  `]
})
export class PolicyDetailComponent implements OnInit {
  policy: Policy | null = null;
  loading = true;
  activating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.policyService.getPolicyById(id).subscribe({
      next: p => { this.policy = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  activatePolicy(): void {
    if (!this.policy) return;
    this.activating = true;
    const userId = this.authService.getUserId()!;
    this.policyService.activatePolicy(this.policy.id, userId).subscribe({
      next: p => { this.policy = p; this.activating = false; },
      error: () => { this.activating = false; }
    });
  }
}
