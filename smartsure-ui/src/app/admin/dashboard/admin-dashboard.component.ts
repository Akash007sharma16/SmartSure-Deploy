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
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = { totalUsers: 0, totalPolicies: 0, totalClaims: 0, pendingClaims: 0 };
  recentClaims: Claim[] = [];
  loading = true;
  statCards: Array<{ icon: string; label: string; value: number; bg: string; iconColor: string; link: string; action: string }> = [];

  actions = [
    { icon: 'fa-solid fa-file-circle-check', label: 'Review Claims',   link: '/admin/claims',   bg: '#eff6ff', iconColor: '#2563eb' },
    { icon: 'fa-solid fa-shield-halved',     label: 'Manage Policies', link: '/admin/policies', bg: '#f0fdf4', iconColor: '#16a34a' },
    { icon: 'fa-solid fa-users',             label: 'Manage Users',    link: '/admin/users',    bg: '#faf5ff', iconColor: '#7c3aed' },
    { icon: 'fa-solid fa-chart-bar',         label: 'Reports',         link: '/reports',        bg: '#fffbeb', iconColor: '#d97706' }
  ];

  badgeClass(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  private buildStatCards(): void {
    this.statCards = [
      { icon: 'fa-solid fa-users',             label: 'Total Users',    value: this.stats.totalUsers,    bg: '#eff6ff', iconColor: '#2563eb', link: '/admin/users',    action: 'Manage' },
      { icon: 'fa-solid fa-shield-halved',     label: 'Total Policies', value: this.stats.totalPolicies, bg: '#f0fdf4', iconColor: '#16a34a', link: '/admin/policies', action: 'Manage' },
      { icon: 'fa-solid fa-file-lines',        label: 'Total Claims',   value: this.stats.totalClaims,   bg: '#fffbeb', iconColor: '#d97706', link: '/admin/claims',   action: 'Review' },
      { icon: 'fa-solid fa-clock',             label: 'Pending Claims', value: this.stats.pendingClaims, bg: '#fef2f2', iconColor: '#dc2626', link: '/admin/claims',   action: 'Review' }
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
