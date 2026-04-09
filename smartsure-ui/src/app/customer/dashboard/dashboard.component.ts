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
    <div class="dashboard">

      <!-- Welcome Banner -->
      <div class="welcome-banner animate-fade-in-up">
        <div>
          <h2>Welcome back, {{ userName }} 👋</h2>
          <p>{{ today }} · Here's your insurance overview</p>
        </div>
        <a routerLink="/customer/buy-policy" class="btn btn-primary">+ Buy New Policy</a>
      </div>

      <!-- Stat Cards -->
      <div class="stats-row">
        <div class="stat-card animate-fade-in-up delay-1">
          <div class="stat-icon blue">📋</div>
          <div class="stat-number">{{ policies.length }}</div>
          <div class="stat-label">My Policies</div>
          <a routerLink="/customer/policies" class="stat-link">View all →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-2">
          <div class="stat-icon green">✅</div>
          <div class="stat-number">{{ activePolicies }}</div>
          <div class="stat-label">Active Policies</div>
          <a routerLink="/customer/policies" class="stat-link">View all →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-3">
          <div class="stat-icon orange">📁</div>
          <div class="stat-number">{{ claims.length }}</div>
          <div class="stat-label">My Claims</div>
          <a routerLink="/claims/track" class="stat-link">View all →</a>
        </div>
        <div class="stat-card animate-fade-in-up delay-4">
          <div class="stat-icon red">⏳</div>
          <div class="stat-number">{{ pendingClaims }}</div>
          <div class="stat-label">Pending Claims</div>
          <a routerLink="/claims/track" class="stat-link">View all →</a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <a routerLink="/customer/buy-policy" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #1e40af, #3b82f6);">🛡️</div>
          <div class="action-label">Buy Policy</div>
        </a>
        <a routerLink="/customer/policies" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #059669, #10b981);">📋</div>
          <div class="action-label">My Policies</div>
        </a>
        <a routerLink="/claims/initiate" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #d97706, #f59e0b);">📝</div>
          <div class="action-label">File Claim</div>
        </a>
        <a routerLink="/claims/track" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #0891b2, #06b6d4);">🔍</div>
          <div class="action-label">Track Claims</div>
        </a>
      </div>

      <!-- Recent Policies Table -->
      <div *ngIf="policies.length > 0">
        <div class="page-header">
          <div class="page-title">
            <h2>Recent Policies</h2>
            <p>Your latest insurance policies</p>
          </div>
          <a routerLink="/customer/policies" class="btn btn-secondary btn-sm">View All</a>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Policy #</th>
              <th>Type</th>
              <th>Coverage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of policies.slice(0, 5)">
              <td><strong>{{ p.policyNumber }}</strong></td>
              <td>{{ p.policyType }}</td>
              <td>{{ p.coverageAmount | currency }}</td>
              <td><span class="badge" [class]="'badge-' + p.status.toLowerCase()">{{ p.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="policies.length === 0" class="empty-state">
        <div class="empty-icon">🛡️</div>
        <h3>No policies yet</h3>
        <p>Get started by purchasing your first insurance policy.</p>
        <br>
        <a routerLink="/customer/buy-policy" class="btn btn-primary">Buy Your First Policy</a>
      </div>
    </div>
  `
})
export class CustomerDashboardComponent implements OnInit {
  policies: Policy[] = [];
  claims: Claim[] = [];
  userName = '';
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private policyService: PolicyService,
    private claimService: ClaimService,
    private authService: AuthService
  ) {}

  get activePolicies(): number {
    return this.policies.filter(p => p.status === 'Active').length;
  }

  get pendingClaims(): number {
    return this.claims.filter(c => c.status === 'Submitted' || c.status === 'UnderReview').length;
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.userName = this.authService.getFullName();

    this.policyService.getCustomerPolicies(userId).subscribe(p => this.policies = p);
    this.claimService.getCustomerClaims(userId).subscribe(c => this.claims = c);
  }
}
