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
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>My Policies</h2>
          <p>Manage and view all your insurance policies</p>
        </div>
        <a routerLink="/customer/buy-policy" class="btn btn-primary">+ Buy New Policy</a>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar" *ngIf="policies.length > 0" style="display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap;">
        <div class="search-input" style="position:relative; flex:1; min-width:200px;">
          <span style="position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); pointer-events:none;">🔍</span>
          <input type="text" class="form-control" placeholder="Search policies..."
                 [(ngModel)]="searchTerm" style="padding-left:2.5rem;" />
        </div>
        <select class="form-control" [(ngModel)]="statusFilter" style="width:auto; min-width:140px;">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <!-- Empty States -->
      <div *ngIf="filteredPolicies.length === 0 && policies.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No policies found</h3>
        <p>You haven't purchased any policies yet.</p>
        <br>
        <a routerLink="/customer/buy-policy" class="btn btn-primary">Buy Your First Policy</a>
      </div>

      <div *ngIf="filteredPolicies.length === 0 && policies.length > 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try adjusting your search or filter.</p>
      </div>

      <!-- Policies Table -->
      <table class="table" *ngIf="filteredPolicies.length > 0">
        <thead>
          <tr>
            <th>Policy #</th>
            <th>Type</th>
            <th>Coverage</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredPolicies">
            <td><strong>{{ p.policyNumber }}</strong></td>
            <td>{{ p.policyType }}</td>
            <td>{{ p.coverageAmount | currency }}</td>
            <td>{{ p.startDate | date:'MMM d, y' }}</td>
            <td>{{ p.endDate | date:'MMM d, y' }}</td>
            <td><span class="badge badge-{{ p.status.toLowerCase() }}">{{ p.status }}</span></td>
            <td>
              <a [routerLink]="['/customer/policies', p.id]" class="btn btn-sm btn-outline-primary">View</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  searchTerm = '';
  statusFilter = '';

  constructor(private policyService: PolicyService, private authService: AuthService) {}

  get filteredPolicies(): Policy[] {
    return this.policies.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.policyNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.policyType?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || p.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.policyService.getCustomerPolicies(userId).subscribe(p => this.policies = p);
  }
}
