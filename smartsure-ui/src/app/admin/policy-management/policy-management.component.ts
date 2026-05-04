import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { PolicyService } from '../../core/services/policy.service';
import { Policy, PolicyType } from '../../core/models/policy.models';
import { policyNameValidator, descriptionValidator, numericRangeValidator, getErrorMessage } from '../../shared/validators/app.validators';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './policy-management.component.html',
  styleUrls: ['./policy-management.component.css']
})
export class PolicyManagementComponent implements OnInit {
  tab = 'types';
  policyTypes: PolicyType[] = [];
  policies: Policy[] = [];
  typeForm: FormGroup;

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  isInvalid(f: string): boolean { const c = this.typeForm.get(f); return !!(c?.invalid && (c.touched || c.dirty)); }
  isValid(f: string):   boolean { const c = this.typeForm.get(f); return !!(c?.valid  && (c.touched || c.dirty)); }
  err(f: string):       string  { return getErrorMessage(f, this.typeForm.get(f)?.errors ?? null); }

  constructor(private adminService: AdminService, private policyService: PolicyService, private fb: FormBuilder) {
    this.typeForm = this.fb.group({
      name:        ['', [Validators.required, policyNameValidator]],
      description: ['', [Validators.required, descriptionValidator(10, 500)]],
      baseRate:    [5,  [Validators.required, numericRangeValidator(0.1, 100)]]
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
    if (!confirm('Are you sure you want to cancel this policy? This action cannot be undone.')) return;
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
