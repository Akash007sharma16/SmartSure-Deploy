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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  policies: Policy[] = [];
  claims: Claim[] = [];
  userName = '';
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  activePolicies = 0;
  pendingClaims  = 0;

  actions = [
    { icon: 'fa-solid fa-shield-halved',      label: 'Buy Policy',   link: '/customer/buy-policy', bg: '#eff6ff', iconColor: '#2563eb' },
    { icon: 'fa-solid fa-file-shield',        label: 'My Policies',  link: '/customer/policies',   bg: '#f0fdf4', iconColor: '#16a34a' },
    { icon: 'fa-solid fa-pen-to-square',      label: 'File Claim',   link: '/claims/initiate',     bg: '#fffbeb', iconColor: '#d97706' },
    { icon: 'fa-solid fa-magnifying-glass',   label: 'Track Claims', link: '/claims/track',        bg: '#faf5ff', iconColor: '#7c3aed' }
  ];

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  constructor(
    private policyService: PolicyService,
    private claimService: ClaimService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.userName = this.authService.getFullName();
    this.policyService.getCustomerPolicies(userId).subscribe({
      next: p => { this.policies = p ?? []; this.activePolicies = this.policies.filter(x => x.status === 'Active').length; },
      error: () => this.policies = []
    });
    this.claimService.getCustomerClaims(userId).subscribe({
      next: c => { this.claims = c ?? []; this.pendingClaims = this.claims.filter(x => x.status === 'Submitted' || x.status === 'UnderReview').length; },
      error: () => this.claims = []
    });
  }
}
