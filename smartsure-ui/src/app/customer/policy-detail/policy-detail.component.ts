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
  <div>
    <!-- Loading -->
    <div *ngIf="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-3 text-muted">Loading policy details...</p>
    </div>

    <!-- Not found -->
    <div *ngIf="!policy && !loading" class="ss-empty">
      <div class="ss-empty-icon">❌</div>
      <h3>Policy not found</h3>
      <p>The policy you're looking for doesn't exist or you don't have access.</p>
      <a routerLink="/customer/policies" class="btn btn-primary mt-3 px-4">← Back to Policies</a>
    </div>

    <div *ngIf="policy && !loading">
      <!-- Header -->
      <div class="ss-page-header mb-4">
        <div>
          <h2 class="ss-page-title">Policy Details</h2>
          <p class="ss-page-sub">{{ policy.policyNumber }}</p>
        </div>
        <a routerLink="/customer/policies" class="btn btn-outline-secondary">← Back to Policies</a>
      </div>

      <div class="row g-4">
        <!-- Left: Policy Card -->
        <div class="col-lg-5">
          <div class="ss-policy-hero-card">
            <div class="ss-phc-top">
              <div class="ss-phc-icon">🛡️</div>
              <div>
                <div class="ss-phc-num">{{ policy.policyNumber }}</div>
                <div class="ss-phc-type">{{ policy.policyType }}</div>
              </div>
              <span class="ss-badge ms-auto" [ngClass]="badge(policy.status)">{{ policy.status }}</span>
            </div>
            <div class="ss-phc-coverage">
              <div class="ss-phc-cov-lbl">Coverage Amount</div>
              <div class="ss-phc-cov-val">{{ policy.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</div>
            </div>
            <div class="ss-phc-premium">
              <div class="ss-phc-prem-lbl">Annual Premium</div>
              <div class="ss-phc-prem-val">{{ policy.premiumAmount | currency:'INR':'symbol':'1.0-0' }}/yr</div>
            </div>
            <div class="ss-phc-dates">
              <div>
                <div class="ss-phc-date-lbl">Start Date</div>
                <div class="ss-phc-date-val">{{ policy.startDate | date:'MMM d, y' }}</div>
              </div>
              <div class="ss-phc-date-sep">→</div>
              <div>
                <div class="ss-phc-date-lbl">End Date</div>
                <div class="ss-phc-date-val">{{ policy.endDate | date:'MMM d, y' }}</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex flex-column gap-2 mt-3" *ngIf="policy.status === 'Draft'">
            <button class="btn btn-success btn-lg" [disabled]="activating" (click)="activatePolicy()">
              <span *ngIf="activating" class="spinner-border spinner-border-sm me-2"></span>
              {{ activating ? 'Activating...' : '✅ Activate Policy' }}
            </button>
          </div>
          <div class="d-flex gap-2 mt-3" *ngIf="policy.status === 'Active'">
            <a routerLink="/claims/initiate" class="btn btn-warning flex-fill">📝 File a Claim</a>
            <a [routerLink]="['/customer/upload-documents', policy.id]" class="btn btn-outline-primary flex-fill">📎 Upload Docs</a>
          </div>
        </div>

        <!-- Right: Details -->
        <div class="col-lg-7">
          <div class="ss-detail-card">
            <div class="ss-detail-card-header">Policy Information</div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Policy Number</span>
              <span class="ss-dr-val fw-bold">{{ policy.policyNumber }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Policy Type</span>
              <span class="ss-dr-val">{{ policy.policyType }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Coverage Amount</span>
              <span class="ss-dr-val">{{ policy.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Annual Premium</span>
              <span class="ss-dr-val text-primary fw-bold" style="font-size:1.05rem;">{{ policy.premiumAmount | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Start Date</span>
              <span class="ss-dr-val">{{ policy.startDate | date:'mediumDate' }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">End Date</span>
              <span class="ss-dr-val">{{ policy.endDate | date:'mediumDate' }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Status</span>
              <span class="ss-badge" [ngClass]="badge(policy.status)">{{ policy.status }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Created On</span>
              <span class="ss-dr-val">{{ policy.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <!-- Payment History -->
          <div class="ss-detail-card mt-3" *ngIf="policy.status === 'Active' || policy.status === 'Expired'">
            <div class="ss-detail-card-header">Payment History</div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Payment Status</span>
              <span class="ss-badge ss-badge-active">Completed</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Amount Paid</span>
              <span class="ss-dr-val text-success fw-bold">{{ policy.premiumAmount | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="ss-detail-row">
              <span class="ss-dr-lbl">Payment Method</span>
              <span class="ss-dr-val">Online Payment</span>
            </div>
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
    .ss-policy-hero-card {
      background:linear-gradient(135deg,#1e3a5f,#2563eb); border-radius:20px; padding:2rem; color:white;
      box-shadow:0 16px 48px rgba(30,58,95,0.3);
    }
    .ss-phc-top { display:flex; align-items:center; gap:1rem; margin-bottom:1.75rem; }
    .ss-phc-icon { width:52px; height:52px; background:rgba(255,255,255,0.15); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; }
    .ss-phc-num { font-size:0.875rem; font-weight:800; }
    .ss-phc-type { font-size:0.78rem; color:rgba(255,255,255,0.7); }
    .ss-phc-coverage { margin-bottom:1.25rem; }
    .ss-phc-cov-lbl { font-size:0.75rem; color:rgba(255,255,255,0.65); margin-bottom:0.25rem; }
    .ss-phc-cov-val { font-size:2rem; font-weight:900; }
    .ss-phc-premium { background:rgba(255,255,255,0.1); border-radius:10px; padding:0.875rem 1rem; margin-bottom:1.25rem; }
    .ss-phc-prem-lbl { font-size:0.75rem; color:rgba(255,255,255,0.65); margin-bottom:0.2rem; }
    .ss-phc-prem-val { font-size:1.25rem; font-weight:800; }
    .ss-phc-dates { display:flex; align-items:center; gap:1rem; }
    .ss-phc-date-lbl { font-size:0.72rem; color:rgba(255,255,255,0.6); margin-bottom:0.2rem; }
    .ss-phc-date-val { font-size:0.9rem; font-weight:700; }
    .ss-phc-date-sep { font-size:1.25rem; color:rgba(255,255,255,0.4); }
    .ss-detail-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; }
    .ss-detail-card-header { padding:1rem 1.25rem; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:0.8rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; }
    .ss-detail-row { display:flex; justify-content:space-between; align-items:center; padding:0.875rem 1.25rem; border-bottom:1px solid #f1f5f9; &:last-child { border-bottom:none; } }
    .ss-dr-lbl { font-size:0.875rem; color:#64748b; }
    .ss-dr-val { font-size:0.875rem; font-weight:600; color:#1e293b; }
    .ss-badge { display:inline-flex; align-items:center; padding:0.3rem 0.875rem; border-radius:100px; font-size:0.72rem; font-weight:700; }
    .ss-badge-active { background:#d1fae5; color:#065f46; }
    .ss-badge-draft { background:#f1f5f9; color:#64748b; }
    .ss-badge-expired { background:#fef3c7; color:#92400e; }
    .ss-badge-cancelled { background:#fee2e2; color:#991b1b; }
    .ss-empty { text-align:center; padding:4rem 2rem; background:white; border:1px solid #e2e8f0; border-radius:14px; }
    .ss-empty-icon { font-size:3.5rem; margin-bottom:1rem; }
    h3 { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:0.5rem; }
    p { font-size:0.875rem; color:#64748b; margin:0; }
  `]
})
export class PolicyDetailComponent implements OnInit {
  policy: Policy | null = null;
  loading = true;
  activating = false;

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  constructor(private route: ActivatedRoute, private router: Router, private policyService: PolicyService, private authService: AuthService) {}

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
    this.policyService.activatePolicy(this.policy.id, this.authService.getUserId()!).subscribe({
      next: p => { this.policy = p; this.activating = false; },
      error: () => { this.activating = false; }
    });
  }
}
