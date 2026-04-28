import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { DashboardStats } from '../../core/models/report.models';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div>
    <!-- Header -->
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">Admin Dashboard</h2>
        <p class="ss-page-sub">Platform overview and management controls</p>
      </div>
      <div class="d-flex gap-2">
        <a routerLink="/reports" class="btn btn-outline-primary">📈 Reports</a>
        <a routerLink="/admin/claims" class="btn btn-primary">Review Claims</a>
      </div>
    </div>

    <!-- Warning -->
    <div *ngIf="stats.totalUsers===0 && stats.totalPolicies===0 && !loading" class="alert alert-warning d-flex align-items-center gap-2 mb-4">
      <span>⚠️</span>
      <span>Dashboard stats show zero — ensure all microservices are running and reachable.</span>
    </div>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3" *ngFor="let s of statCards">
        <div class="ss-stat-card">
          <div class="ss-sc-icon" [style.background]="s.bg">{{ s.icon }}</div>
          <div class="ss-sc-num">{{ s.value }}</div>
          <div class="ss-sc-lbl">{{ s.label }}</div>
          <a [routerLink]="s.link" class="ss-sc-link">{{ s.action }} →</a>
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

    <!-- Recent Claims -->
    <div class="ss-card" *ngIf="recentClaims.length > 0">
      <div class="ss-card-header">
        <div>
          <h3 class="ss-card-title">Recent Claims</h3>
          <p class="ss-card-sub">Latest claims requiring attention</p>
        </div>
        <a routerLink="/admin/claims" class="btn btn-outline-primary btn-sm">View All</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Claim ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of recentClaims.slice(0,5)">
              <td class="fw-bold">#{{ c.id }}</td>
              <td>Customer #{{ c.customerId }}</td>
              <td>{{ c.claimAmount | currency:'INR':'symbol':'1.0-0' }}</td>
              <td><span class="ss-badge" [ngClass]="badgeClass(c.status)">{{ c.status }}</span></td>
              <td><a routerLink="/admin/claims" class="btn btn-sm btn-outline-primary">Review</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="recentClaims.length === 0 && !loading" class="ss-empty">
      <div class="ss-empty-icon">📁</div>
      <h3>No claims yet</h3>
      <p>Claims will appear here once customers start filing them.</p>
    </div>
  </div>
  `,
  styles: [`
    .ss-page-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
    .ss-page-title { font-size:1.5rem; font-weight:900; color:#1e3a5f; margin:0 0 0.25rem; }
    .ss-page-sub { font-size:0.85rem; color:#64748b; margin:0; }
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
    .ss-badge-submitted { background:#dbeafe; color:#1e40af; }
    .ss-badge-underreview { background:#fef3c7; color:#92400e; }
    .ss-badge-approved { background:#d1fae5; color:#065f46; }
    .ss-badge-rejected { background:#fee2e2; color:#991b1b; }
    .ss-badge-closed { background:#f1f5f9; color:#475569; }
    .ss-badge-draft { background:#f1f5f9; color:#64748b; }
    .ss-empty { text-align:center; padding:4rem 2rem; background:white; border:1px solid #e2e8f0; border-radius:14px; }
    .ss-empty-icon { font-size:3.5rem; margin-bottom:1rem; }
    h3 { font-size:1.1rem; font-weight:800; color:#1e3a5f; margin-bottom:0.5rem; }
    p { font-size:0.875rem; color:#64748b; margin:0; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = { totalUsers:0, totalPolicies:0, totalClaims:0, pendingClaims:0 };
  recentClaims: Claim[] = [];
  loading = true;

  // FIX: static array — NOT a getter. Getters recreate arrays every change detection cycle → infinite loop
  statCards: Array<{icon:string; label:string; value:number; bg:string; link:string; action:string}> = [];

  actions = [
    { icon:'📁', label:'Review Claims',   link:'/admin/claims',   bg:'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
    { icon:'📋', label:'Manage Policies', link:'/admin/policies', bg:'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
    { icon:'👥', label:'Manage Users',    link:'/admin/users',    bg:'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
    { icon:'📈', label:'Reports',         link:'/reports',        bg:'linear-gradient(135deg,#fef3c7,#fde68a)' }
  ];

  // FIX: safe badge class — handles null/undefined status
  badgeClass(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  private buildStatCards(): void {
    this.statCards = [
      { icon:'👥', label:'Total Users',    value:this.stats.totalUsers,    bg:'#dbeafe', link:'/admin/users',    action:'Manage' },
      { icon:'📋', label:'Total Policies', value:this.stats.totalPolicies, bg:'#d1fae5', link:'/admin/policies', action:'Manage' },
      { icon:'📁', label:'Total Claims',   value:this.stats.totalClaims,   bg:'#fef3c7', link:'/admin/claims',   action:'Review' },
      { icon:'⏳', label:'Pending Claims', value:this.stats.pendingClaims, bg:'#fee2e2', link:'/admin/claims',   action:'Review' }
    ];
  }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.buildStatCards();
    this.adminService.getDashboardStats().subscribe({
      next: s => { this.stats = s; this.loading = false; this.buildStatCards(); },
      error: () => { this.loading = false; }
    });
    this.adminService.getAllClaims().subscribe({
      next: c => this.recentClaims = c ?? [],
      error: () => this.recentClaims = []
    });
  }
}
