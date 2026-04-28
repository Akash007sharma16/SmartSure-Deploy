import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">My Policies</h2>
        <p class="ss-page-sub">Manage and view all your insurance policies</p>
      </div>
      <a routerLink="/customer/buy-policy" class="btn btn-primary px-4">+ Buy New Policy</a>
    </div>

    <!-- Filters -->
    <div class="ss-filter-bar mb-4" *ngIf="policies.length > 0">
      <div class="ss-search-wrap">
        <span class="ss-search-icon">🔍</span>
        <input type="text" class="form-control" placeholder="Search by policy number or type..." [(ngModel)]="searchTerm" />
      </div>
      <select class="form-select" [(ngModel)]="statusFilter" style="width:auto;min-width:160px;">
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
        <option value="Expired">Expired</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Empty -->
    <div *ngIf="policies.length === 0" class="ss-empty">
      <div class="ss-empty-icon">📋</div>
      <h3>No policies yet</h3>
      <p>You haven't purchased any policies yet.</p>
      <a routerLink="/customer/buy-policy" class="btn btn-primary mt-3 px-4">Buy Your First Policy</a>
    </div>

    <div *ngIf="filteredPolicies.length === 0 && policies.length > 0" class="ss-empty">
      <div class="ss-empty-icon">🔍</div>
      <h3>No results found</h3>
      <p>Try adjusting your search or filter.</p>
    </div>

    <!-- Policy Cards -->
    <div class="row g-3" *ngIf="filteredPolicies.length > 0">
      <div class="col-md-6 col-xl-4" *ngFor="let p of filteredPolicies">
        <div class="ss-policy-card">
          <div class="ss-pc-header">
            <div class="ss-pc-icon">🛡️</div>
            <div class="flex-grow-1">
              <div class="ss-pc-num">{{ p.policyNumber }}</div>
              <div class="ss-pc-type">{{ p.policyType }}</div>
            </div>
            <span class="ss-badge" [ngClass]="badge(p.status)">{{ p.status }}</span>
          </div>
          <div class="ss-pc-body">
            <div class="ss-pc-row">
              <span class="ss-pc-lbl">Coverage</span>
              <span class="ss-pc-val">{{ p.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
            <div class="ss-pc-row">
              <span class="ss-pc-lbl">Premium</span>
              <span class="ss-pc-val text-primary fw-bold">{{ p.premiumAmount | currency:'INR':'symbol':'1.0-0' }}/yr</span>
            </div>
            <div class="ss-pc-row">
              <span class="ss-pc-lbl">Valid</span>
              <span class="ss-pc-val">{{ p.startDate | date:'MMM d, y' }} – {{ p.endDate | date:'MMM d, y' }}</span>
            </div>
          </div>
          <div class="ss-pc-footer">
            <a [routerLink]="['/customer/policies', p.id]" class="btn btn-outline-primary btn-sm w-100">View Details →</a>
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
    .ss-filter-bar { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .ss-search-wrap { position:relative; flex:1; min-width:220px;
      .ss-search-icon { position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); pointer-events:none; }
      input { padding-left:2.5rem; border:1.5px solid #e2e8f0; border-radius:10px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    }
    .form-select { border:1.5px solid #e2e8f0; border-radius:10px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    .ss-policy-card { background:white; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; transition:all 0.2s; height:100%;
      &:hover { box-shadow:0 8px 28px rgba(30,58,95,0.12); transform:translateY(-3px); }
    }
    .ss-pc-header { display:flex; align-items:center; gap:0.875rem; padding:1.25rem; border-bottom:1px solid #e2e8f0; background:#f8fafc; }
    .ss-pc-icon { width:44px; height:44px; background:linear-gradient(135deg,#1e3a5f,#2563eb); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; }
    .ss-pc-num { font-size:0.875rem; font-weight:800; color:#1e3a5f; }
    .ss-pc-type { font-size:0.75rem; color:#64748b; }
    .ss-pc-body { padding:1.25rem; }
    .ss-pc-row { display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid #f1f5f9; &:last-child { border-bottom:none; } }
    .ss-pc-lbl { font-size:0.8rem; color:#64748b; }
    .ss-pc-val { font-size:0.875rem; font-weight:600; color:#1e293b; }
    .ss-pc-footer { padding:1rem 1.25rem; border-top:1px solid #e2e8f0; }
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
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  private _searchTerm = '';
  private _statusFilter = '';

  get searchTerm(): string { return this._searchTerm; }
  set searchTerm(v: string) { this._searchTerm = v; this.applyFilter(); }

  get statusFilter(): string { return this._statusFilter; }
  set statusFilter(v: string) { this._statusFilter = v; this.applyFilter(); }

  // Safe badge — never crashes on null status
  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  private applyFilter(): void {
    this.filteredPolicies = this.policies.filter(p => {
      const ms = !this._searchTerm ||
        (p.policyNumber ?? '').toLowerCase().includes(this._searchTerm.toLowerCase()) ||
        (p.policyType ?? '').toLowerCase().includes(this._searchTerm.toLowerCase());
      const mf = !this._statusFilter || p.status === this._statusFilter;
      return ms && mf;
    });
  }

  constructor(private policyService: PolicyService, private authService: AuthService) {}

  ngOnInit(): void {
    this.policyService.getCustomerPolicies(this.authService.getUserId()!).subscribe({
      next: p => { this.policies = p ?? []; this.applyFilter(); },
      error: () => { this.policies = []; this.filteredPolicies = []; }
    });
  }
}
