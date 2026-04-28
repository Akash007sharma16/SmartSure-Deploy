import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div>
    <!-- Welcome Banner -->
    <div class="ss-welcome-banner mb-4">
      <div class="ss-wb-left">
        <div class="ss-wb-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
        <div>
          <h2 class="ss-wb-title">Welcome back, {{ userName }}! 👋</h2>
          <p class="ss-wb-sub">{{ today }} · Here's your insurance overview</p>
        </div>
      </div>
      <a routerLink="/customer/buy-policy" class="btn btn-light fw-bold px-4">
        + Buy New Policy
      </a>
    </div>

    <!-- Stat Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="ss-stat-card">
          <div class="ss-sc-icon" style="background:#dbeafe">📋</div>
          <div class="ss-sc-num">{{ policies.length }}</div>
          <div class="ss-sc-lbl">My Policies</div>
          <a routerLink="/customer/policies" class="ss-sc-link">View all →</a>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="ss-stat-card">
          <div class="ss-sc-icon" style="background:#d1fae5">✅</div>
          <div class="ss-sc-num">{{ activePolicies }}</div>
          <div class="ss-sc-lbl">Active Policies</div>
          <a routerLink="/customer/policies" class="ss-sc-link">View all →</a>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="ss-stat-card">
          <div class="ss-sc-icon" style="background:#fef3c7">📁</div>
          <div class="ss-sc-num">{{ claims.length }}</div>
          <div class="ss-sc-lbl">My Claims</div>
          <a routerLink="/claims/track" class="ss-sc-link">View all →</a>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="ss-stat-card">
          <div class="ss-sc-icon" style="background:#fee2e2">⏳</div>
          <div class="ss-sc-num">{{ pendingClaims }}</div>
          <div class="ss-sc-lbl">Pending Claims</div>
          <a routerLink="/claims/track" class="ss-sc-link">View all →</a>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3" *ngFor="let a of actions">
        <a [routerLink]="a.link" class="ss-action-card">
          <div class="ss-ac-icon" [style.background]="a.bg">{{ a.icon }}</div>
          <div class="ss-ac-label">{{ a.label }}</div>
          <div class="ss-ac-arrow">→</div>
        </a>
      </div>
    </div>

    <!-- Recent Policies -->
    <div class="ss-card" *ngIf="policies.length > 0">
      <div class="ss-card-header">
        <div>
          <h3 class="ss-card-title">Recent Policies</h3>
          <p class="ss-card-sub">Your latest insurance policies</p>
        </div>
        <a routerLink="/customer/policies" class="btn btn-outline-primary btn-sm">View All</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Policy #</th><th>Type</th><th>Coverage</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of policies.slice(0,5)">
              <td class="fw-bold">{{ p.policyNumber }}</td>
              <td>{{ p.policyType }}</td>
              <td>{{ p.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td><span class="ss-badge" [ngClass]="badge(p.status)">{{ p.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div *ngIf="policies.length === 0" class="ss-empty">
      <div class="ss-empty-icon">🛡️</div>
      <h3>No policies yet</h3>
      <p>Get started by purchasing your first insurance policy.</p>
      <a routerLink="/customer/buy-policy" class="btn btn-primary mt-3 px-4">Buy Your First Policy</a>
    </div>
  </div>
  `,
  styles: [`
    .ss-welcome-banner {
      background:linear-gradient(135deg,#1e3a5f,#2563eb); border-radius:16px;
      padding:1.75rem 2rem; color:white; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
    }
    .ss-wb-left { display:flex; align-items:center; gap:1rem; }
    .ss-wb-avatar { width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:800; flex-shrink:0; }
    .ss-wb-title { font-size:1.25rem; font-weight:800; margin:0 0 0.25rem; }
    .ss-wb-sub { font-size:0.85rem; opacity:0.8; margin:0; }
    .ss-stat-card { background:white; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; transition:all 0.2s; height:100%;
      &:hover { box-shadow:0 8px 24px rgba(30,58,95,0.1); transform:translateY(-3px); }
    }
    .ss-sc-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; margin-bottom:0.875rem; }
    .ss-sc-num { font-size:2rem; font-weight:900; color:#1e3a5f; line-height:1; }
    .ss-sc-lbl { font-size:0.8rem; color:#64748b; font-weight:500; margin-top:0.25rem; }
    .ss-sc-link { font-size:0.78rem; color:#2563eb; font-weight:600; margin-top:0.5rem; display:block; text-decoration:none; }
    .ss-action-card { background:white; border:1px solid #e2e8f0; border-radius:14px; padding:1.25rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.625rem; transition:all 0.2s; text-decoration:none; color:inherit;
      &:hover { box-shadow:0 8px 24px rgba(30,58,95,0.1); transform:translateY(-3px); border-color:#bfdbfe; }
    }
    .ss-ac-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
    .ss-ac-label { font-size:0.85rem; font-weight:700; color:#1e293b; }
    .ss-ac-arrow { font-size:1rem; color:#2563eb; }
    .ss-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; }
    .ss-card-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; background:#f8fafc; }
    .ss-card-title { font-size:1rem; font-weight:800; color:#1e3a5f; margin:0 0 0.2rem; }
    .ss-card-sub { font-size:0.78rem; color:#64748b; margin:0; }
    .ss-badge { display:inline-flex; align-items:center; padding:0.25rem 0.75rem; border-radius:100px; font-size:0.72rem; font-weight:700; }
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
export class CustomerDashboardComponent implements OnInit {
  policies: Policy[] = [];
  claims: Claim[] = [];
  userName = '';
  today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  activePolicies = 0;
  pendingClaims  = 0;

  actions = [
    { icon:'🛡️', label:'Buy Policy',   link:'/customer/buy-policy', bg:'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
    { icon:'📋', label:'My Policies',  link:'/customer/policies',   bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
    { icon:'📝', label:'File Claim',   link:'/claims/initiate',     bg:'linear-gradient(135deg,#fef3c7,#fde68a)' },
    { icon:'🔍', label:'Track Claims', link:'/claims/track',        bg:'linear-gradient(135deg,#cffafe,#a5f3fc)' }
  ];

  // Safe badge — never crashes on null status
  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  constructor(private policyService: PolicyService, private claimService: ClaimService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.userName = this.authService.getFullName();
    this.policyService.getCustomerPolicies(userId).subscribe({
      next: p => {
        this.policies = p ?? [];
        this.activePolicies = this.policies.filter(x => x.status === 'Active').length;
      },
      error: () => this.policies = []
    });
    this.claimService.getCustomerClaims(userId).subscribe({
      next: c => {
        this.claims = c ?? [];
        this.pendingClaims = this.claims.filter(x => x.status === 'Submitted' || x.status === 'UnderReview').length;
      },
      error: () => this.claims = []
    });
  }
}
