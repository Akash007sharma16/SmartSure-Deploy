import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { PolicyService } from '../../core/services/policy.service';
import { Policy, PolicyType } from '../../core/models/policy.models';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>Policy Management</h2>
          <p>Manage policy types and all customer policies</p>
        </div>
      </div>

      <!-- Pill Tabs -->
      <div class="tabs">
        <button class="btn" [class.active]="tab === 'types'" (click)="tab = 'types'">
          🏷️ Policy Types
        </button>
        <button class="btn" [class.active]="tab === 'policies'" (click)="tab = 'policies'">
          📋 All Policies
        </button>
      </div>

      <!-- Policy Types Tab -->
      <div *ngIf="tab === 'types'">
        <!-- Add Type Form -->
        <div class="chart-wrapper" style="margin-bottom:1.5rem;">
          <div class="chart-title">Add New Policy Type</div>
          <form [formGroup]="typeForm" (ngSubmit)="createType()" class="inline-form">
            <input formControlName="name" placeholder="Type name (e.g. Health)" class="form-control" style="flex:1;" />
            <input formControlName="description" placeholder="Description" class="form-control" style="flex:2;" />
            <input formControlName="baseRate" type="number" placeholder="Base Rate %" class="form-control" style="width:130px;" />
            <button type="submit" class="btn btn-primary" [disabled]="typeForm.invalid">+ Add Type</button>
          </form>
        </div>

        <div *ngIf="policyTypes.length === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>
          <h3>No policy types yet</h3>
          <p>Add your first policy type using the form above.</p>
        </div>

        <div class="type-cards-grid" *ngIf="policyTypes.length > 0">
          <div *ngFor="let t of policyTypes" class="type-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <div class="type-card-icon">🛡️</div>
              <button class="btn btn-sm btn-danger" (click)="deletePolicyType(t.id)" title="Delete">✕</button>
            </div>
            <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.25rem;">{{ t.name }}</h4>
            <p style="font-size:0.8rem; color:#64748b; margin-bottom:0.75rem;">{{ t.description }}</p>
            <span style="background:#dbeafe; color:#1e40af; font-size:0.75rem; font-weight:700; padding:0.25rem 0.625rem; border-radius:6px;">
              {{ t.baseRate }}% base rate
            </span>
          </div>
        </div>
      </div>

      <!-- All Policies Tab -->
      <div *ngIf="tab === 'policies'">
        <div *ngIf="policies.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No policies found</h3>
          <p>Policies will appear here once customers purchase them.</p>
        </div>

        <table class="table" *ngIf="policies.length > 0">
          <thead>
            <tr>
              <th>Policy #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Coverage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of policies">
              <td><strong>{{ p.policyNumber }}</strong></td>
              <td>Customer #{{ p.customerId }}</td>
              <td>{{ p.policyType }}</td>
              <td>{{ p.coverageAmount | currency }}</td>
              <td><span class="badge badge-{{ p.status.toLowerCase() }}">{{ p.status }}</span></td>
              <td>
                <button class="btn btn-sm btn-danger" *ngIf="p.status === 'Active'"
                        (click)="cancelPolicy(p.id)">Cancel</button>
                <span *ngIf="p.status !== 'Active'" style="color:#94a3b8; font-size:0.8rem;">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .type-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .type-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s;
    }
    .type-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
    .type-card-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
    }
  `]
})
export class PolicyManagementComponent implements OnInit {
  tab = 'types';
  policyTypes: PolicyType[] = [];
  policies: Policy[] = [];
  typeForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private policyService: PolicyService,
    private fb: FormBuilder
  ) {
    this.typeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      baseRate: [5, [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit(): void {
    this.adminService.getPolicyTypes().subscribe(t => this.policyTypes = t);
    this.policyService.getAllPolicies().subscribe(p => this.policies = p);
  }

  createType(): void {
    this.adminService.createPolicyType(this.typeForm.value).subscribe(t => {
      this.policyTypes.push(t);
      this.typeForm.reset({ baseRate: 5 });
    });
  }

  cancelPolicy(id: number): void {
    this.policyService.updatePolicyStatus(id, 'Cancelled').subscribe(updated => {
      const idx = this.policies.findIndex(p => p.id === id);
      if (idx !== -1) this.policies[idx] = updated;
    });
  }

  deletePolicyType(id: number): void {
    if (!confirm('Delete this policy type?')) return;
    this.adminService.deletePolicyType(id).subscribe({
      next: () => this.policyTypes = this.policyTypes.filter(t => t.id !== id),
      error: () => alert('Failed to delete policy type.')
    });
  }
}
