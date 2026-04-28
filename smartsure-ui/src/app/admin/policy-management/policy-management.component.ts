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
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">Policy Management</h2>
        <p class="ss-page-sub">Manage policy types and all customer policies</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="ss-tabs mb-4">
      <button [class.ss-tab-active]="tab==='types'" (click)="tab='types'">🏷️ Policy Types</button>
      <button [class.ss-tab-active]="tab==='policies'" (click)="tab='policies'">📋 All Policies</button>
    </div>

    <!-- Policy Types Tab -->
    <div *ngIf="tab==='types'">
      <div class="ss-card mb-4">
        <div class="ss-card-header">
          <div>
            <h3 class="ss-card-title">Add New Policy Type</h3>
            <p class="ss-card-sub">Create a new insurance product</p>
          </div>
        </div>
        <div class="p-4">
          <form [formGroup]="typeForm" (ngSubmit)="createType()">
            <div class="row g-3">
              <div class="col-md-3">
                <input formControlName="name" placeholder="Type name (e.g. Health)" class="form-control" />
              </div>
              <div class="col-md-5">
                <input formControlName="description" placeholder="Description" class="form-control" />
              </div>
              <div class="col-md-2">
                <input formControlName="baseRate" type="number" placeholder="Base Rate %" class="form-control" />
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100" [disabled]="typeForm.invalid">+ Add Type</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="policyTypes.length === 0" class="ss-empty">
        <div class="ss-empty-icon">🏷️</div>
        <h3>No policy types yet</h3>
        <p>Add your first policy type using the form above.</p>
      </div>

      <div class="row g-3" *ngIf="policyTypes.length > 0">
        <div class="col-md-4 col-xl-3" *ngFor="let t of policyTypes">
          <div class="ss-type-card">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="ss-type-icon">🛡️</div>
              <button class="btn btn-sm btn-danger" (click)="deletePolicyType(t.id)">✕</button>
            </div>
            <h4 class="ss-type-name">{{ t.name }}</h4>
            <p class="ss-type-desc">{{ t.description }}</p>
            <span class="ss-rate-badge">{{ t.baseRate }}% base rate</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Policies Tab -->
    <div *ngIf="tab==='policies'">
      <div *ngIf="policies.length === 0" class="ss-empty">
        <div class="ss-empty-icon">📋</div>
        <h3>No policies found</h3>
        <p>Policies will appear here once customers purchase them.</p>
      </div>

      <div class="ss-card" *ngIf="policies.length > 0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Policy #</th><th>Customer</th><th>Type</th><th>Coverage</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of policies">
                <td class="fw-bold">{{ p.policyNumber }}</td>
                <td>Customer #{{ p.customerId }}</td>
                <td>{{ p.policyType }}</td>
                <td>{{ p.coverageAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                <td><span class="ss-badge" [ngClass]="badge(p.status)">{{ p.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-danger" *ngIf="p.status==='Active'" (click)="cancelPolicy(p.id)">Cancel</button>
                  <span *ngIf="p.status!=='Active'" class="text-muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .ss-page-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; }
    .ss-page-title { font-size:1.5rem; font-weight:900; color:#1e3a5f; margin:0 0 0.25rem; }
    .ss-page-sub { font-size:0.85rem; color:#64748b; margin:0; }
    .ss-tabs { display:flex; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:4px; width:fit-content; gap:4px;
      button { padding:0.5rem 1.25rem; border:none; background:transparent; color:#64748b; font-size:0.875rem; font-weight:600; border-radius:8px; cursor:pointer; font-family:inherit; transition:all 0.2s;
        &:hover { color:#1e3a5f; }
      }
    }
    .ss-tab-active { background:white !important; color:#1e3a5f !important; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
    .ss-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; }
    .ss-card-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; background:#f8fafc; }
    .ss-card-title { font-size:1rem; font-weight:800; color:#1e3a5f; margin:0 0 0.2rem; }
    .ss-card-sub { font-size:0.78rem; color:#64748b; margin:0; }
    .form-control { border:1.5px solid #e2e8f0; border-radius:8px; &:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.1); } }
    .ss-type-card { background:white; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; transition:all 0.2s; height:100%;
      &:hover { box-shadow:0 8px 24px rgba(30,58,95,0.1); transform:translateY(-2px); }
    }
    .ss-type-icon { width:44px; height:44px; background:linear-gradient(135deg,#1e3a5f,#2563eb); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; }
    .ss-type-name { font-size:1rem; font-weight:800; color:#1e3a5f; margin:0 0 0.375rem; }
    .ss-type-desc { font-size:0.8rem; color:#64748b; margin-bottom:0.875rem; line-height:1.5; }
    .ss-rate-badge { background:#dbeafe; color:#1e40af; font-size:0.75rem; font-weight:700; padding:0.25rem 0.75rem; border-radius:100px; }
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
export class PolicyManagementComponent implements OnInit {
  tab = 'types';
  policyTypes: PolicyType[] = [];
  policies: Policy[] = [];
  typeForm: FormGroup;

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  constructor(private adminService: AdminService, private policyService: PolicyService, private fb: FormBuilder) {
    this.typeForm = this.fb.group({ name: ['', Validators.required], description: ['', Validators.required], baseRate: [5, [Validators.required, Validators.min(0.1)]] });
  }

  ngOnInit(): void {
    this.adminService.getPolicyTypes().subscribe(t => this.policyTypes = t);
    this.policyService.getAllPolicies().subscribe(p => this.policies = p);
  }

  createType(): void {
    this.adminService.createPolicyType(this.typeForm.value).subscribe(t => { this.policyTypes.push(t); this.typeForm.reset({ baseRate: 5 }); });
  }

  cancelPolicy(id: number): void {
    this.policyService.updatePolicyStatus(id, 'Cancelled').subscribe(updated => { const idx = this.policies.findIndex(p => p.id === id); if (idx !== -1) this.policies[idx] = updated; });
  }

  deletePolicyType(id: number): void {
    if (!confirm('Delete this policy type?')) return;
    this.adminService.deletePolicyType(id).subscribe({ next: () => this.policyTypes = this.policyTypes.filter(t => t.id !== id), error: () => alert('Failed to delete policy type.') });
  }
}
