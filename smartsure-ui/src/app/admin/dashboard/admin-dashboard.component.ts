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
    <div class="dashboard">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h2>Admin Dashboard</h2>
          <p>Platform overview and management controls</p>
        </div>
        <div style="display:flex; gap:0.75rem;">
          <a routerLink="/reports" class="btn btn-secondary">📈 Reports</a>
          <a routerLink="/admin/claims" class="btn btn-primary">Review Claims</a>
        </div>
      </div>

      <!-- Stats Warning Banner -->
      <div *ngIf="stats.totalUsers === 0 && stats.totalPolicies === 0 && stats.totalClaims === 0 && !loading"
           class="alert alert-warning animate-fade-in-up" style="margin-bottom:1.5rem;">
        ⚠️ Dashboard stats show zero — ensure all microservices (Identity, Policy, Claims) are running and reachable.
      </div>

      <!-- Stat Cards -->
      <div class="stats-row">
        <div class="stat-card animate-fade-in-up delay-1">
          <div class="stat-icon blue">👥</div>
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
          <a routerLink="/admin/users" class="stat-link">Manage →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-2">
          <div class="stat-icon green">📋</div>
          <div class="stat-number">{{ stats.totalPolicies }}</div>
          <div class="stat-label">Total Policies</div>
          <a routerLink="/admin/policies" class="stat-link">Manage →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-3">
          <div class="stat-icon orange">📁</div>
          <div class="stat-number">{{ stats.totalClaims }}</div>
          <div class="stat-label">Total Claims</div>
          <a routerLink="/admin/claims" class="stat-link">Review →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-4">
          <div class="stat-icon red">⏳</div>
          <div class="stat-number">{{ stats.pendingClaims }}</div>
          <div class="stat-label">Pending Claims</div>
          <a routerLink="/admin/claims" class="stat-link">Review →</a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/admin/claims" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #1e40af, #3b82f6);">📁</div>
          <div class="action-label">Review Claims</div>
        </a>
        <a routerLink="/admin/policies" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #059669, #10b981);">📋</div>
          <div class="action-label">Manage Policies</div>
        </a>
        <a routerLink="/admin/users" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #7c3aed, #a78bfa);">👥</div>
          <div class="action-label">Manage Users</div>
        </a>
        <a routerLink="/reports" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #d97706, #f59e0b);">📈</div>
          <div class="action-label">Reports</div>
        </a>
      </div>

      <!-- Recent Claims Table -->
      <div *ngIf="recentClaims.length > 0">
        <div class="page-header">
          <div class="page-title">
            <h2>Recent Claims</h2>
            <p>Latest claims requiring attention</p>
          </div>
          <a routerLink="/admin/claims" class="btn btn-secondary btn-sm">View All</a>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of recentClaims.slice(0, 5)">
              <td><strong>#{{ c.id }}</strong></td>
              <td>Customer #{{ c.customerId }}</td>
              <td>{{ c.claimAmount | currency }}</td>
              <td><span class="badge badge-{{ c.status.toLowerCase() }}">{{ c.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="recentClaims.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>No claims yet</h3>
        <p>Claims will appear here once customers start filing them.</p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = { totalUsers: 0, totalPolicies: 0, totalClaims: 0, pendingClaims: 0 };
  recentClaims: Claim[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.adminService.getAllClaims().subscribe(c => this.recentClaims = c);
  }
}
