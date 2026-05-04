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
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css']
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
