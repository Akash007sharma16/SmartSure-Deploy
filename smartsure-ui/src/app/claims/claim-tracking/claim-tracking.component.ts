import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-claim-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">My Claims</h2>
        <p class="ss-page-sub">Track the status of all your insurance claims</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-primary rounded-pill px-3 py-2">{{ claims.length }} total</span>
        <a routerLink="/claims/initiate" class="btn btn-primary">+ File New Claim</a>
      </div>
    </div>

    <div *ngIf="claims.length === 0" class="ss-empty">
      <div class="ss-empty-icon">📁</div>
      <h3>No claims filed yet</h3>
      <p>When you file a claim, it will appear here with real-time status updates.</p>
      <a routerLink="/claims/initiate" class="btn btn-primary mt-3 px-4">File Your First Claim</a>
    </div>

    <div class="row g-3" *ngIf="claims.length > 0">
      <div class="col-12" *ngFor="let c of claims">
        <div class="ss-claim-card">
          <div class="ss-claim-bar" [ngClass]="barClass(c.status)"></div>
          <div class="ss-claim-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div class="ss-claim-id">Claim #{{ c.id }}</div>
                <div class="ss-claim-date">Filed {{ c.createdAt | date:'MMM d, y' }}</div>
              </div>
              <span class="ss-badge" [ngClass]="badge(c.status)">{{ c.status }}</span>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-4">
                <div class="ss-claim-meta-lbl">Policy</div>
                <div class="ss-claim-meta-val">#{{ c.policyId }}</div>
              </div>
              <div class="col-4">
                <div class="ss-claim-meta-lbl">Amount</div>
                <div class="ss-claim-meta-val">{{ c.claimAmount | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
              <div class="col-4">
                <div class="ss-claim-meta-lbl">Status</div>
                <div class="ss-claim-meta-val">{{ c.status }}</div>
              </div>
            </div>

            <p class="ss-claim-desc">{{ c.description }}</p>

            <div *ngIf="c.adminRemarks" class="ss-admin-remarks">
              <div class="ss-ar-label">Admin Remarks</div>
              <p class="ss-ar-text">{{ c.adminRemarks }}</p>
            </div>

            <div *ngIf="c.status === 'Draft' || c.status === 'Submitted'" class="mt-3">
              <button class="btn btn-outline-primary btn-sm" (click)="goToUpload(c.id)">
                📎 Upload Documents
              </button>
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
    .ss-claim-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; display:flex; transition:all 0.2s;
      &:hover { box-shadow:0 8px 24px rgba(30,58,95,0.1); }
    }
    .ss-claim-bar { width:5px; flex-shrink:0; }
    .ss-bar-draft { background:#94a3b8; }
    .ss-bar-submitted { background:#2563eb; }
    .ss-bar-underreview { background:#d97706; }
    .ss-bar-approved { background:#16a34a; }
    .ss-bar-rejected { background:#dc2626; }
    .ss-bar-closed { background:#64748b; }
    .ss-claim-body { flex:1; padding:1.5rem; }
    .ss-claim-id { font-size:1rem; font-weight:800; color:#1e3a5f; }
    .ss-claim-date { font-size:0.78rem; color:#64748b; margin-top:0.15rem; }
    .ss-claim-meta-lbl { font-size:0.7rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
    .ss-claim-meta-val { font-size:0.9rem; font-weight:700; color:#1e293b; margin-top:0.2rem; }
    .ss-claim-desc { font-size:0.875rem; color:#475569; margin:0; }
    .ss-admin-remarks { background:#f0f7ff; border:1px solid #bfdbfe; border-radius:10px; padding:0.875rem 1rem; margin-top:0.75rem; }
    .ss-ar-label { font-size:0.72rem; font-weight:700; color:#2563eb; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; }
    .ss-ar-text { font-size:0.875rem; color:#1e3a5f; font-style:italic; margin:0; }
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
  `]
})
export class ClaimTrackingComponent implements OnInit {
  claims: Claim[] = [];

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }
  barClass(status: string | undefined): string {
    return 'ss-bar-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  constructor(private claimService: ClaimService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.claimService.getCustomerClaims(this.authService.getUserId()!).subscribe({
      next: c => this.claims = c ?? [],
      error: () => this.claims = []
    });
  }

  goToUpload(id: number): void { this.router.navigate(['/customer/upload-documents', id]); }
}
