import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-claim-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <h2>My Claims</h2>
          <p>Track the status of all your insurance claims</p>
        </div>
        <span class="badge badge-info" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
          {{ claims.length }} total
        </span>
      </div>

      <!-- Empty State -->
      <div *ngIf="claims.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>No claims filed yet</h3>
        <p>When you file a claim, it will appear here with real-time status updates.</p>
      </div>

      <!-- Timeline Cards -->
      <div *ngFor="let c of claims" class="claim-timeline-card">
        <div class="claim-status-bar" [ngClass]="c.status.toLowerCase().replace(' ', '')"></div>
        <div class="claim-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <div>
              <div style="font-weight:700; font-size:1rem; margin-bottom:0.2rem;">Claim #{{ c.id }}</div>
              <div style="font-size:0.8rem; color:#64748b;">Filed {{ c.createdAt | date:'MMM d, y' }}</div>
            </div>
            <span class="badge badge-{{ c.status.toLowerCase() }}">{{ c.status }}</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:0.75rem;">
            <div>
              <div style="font-size:0.7rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Policy</div>
              <div style="font-size:0.875rem; font-weight:600; margin-top:0.2rem;">#{{ c.policyId }}</div>
            </div>
            <div>
              <div style="font-size:0.7rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Amount</div>
              <div style="font-size:0.875rem; font-weight:600; margin-top:0.2rem;">{{ c.claimAmount | currency }}</div>
            </div>
            <div>
              <div style="font-size:0.7rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Status</div>
              <div style="font-size:0.875rem; font-weight:600; margin-top:0.2rem;">{{ c.status }}</div>
            </div>
          </div>

          <p style="font-size:0.875rem; color:#475569; margin-bottom:0.75rem;">{{ c.description }}</p>

          <div *ngIf="c.adminRemarks" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem; margin-bottom:0.75rem;">
            <div style="font-size:0.75rem; font-weight:700; color:#64748b; margin-bottom:0.25rem;">ADMIN REMARKS</div>
            <p style="font-size:0.875rem; color:#0f172a; font-style:italic;">{{ c.adminRemarks }}</p>
          </div>

          <div *ngIf="c.status === 'Draft' || c.status === 'Submitted'" style="margin-top:0.75rem;">
            <button class="btn btn-secondary btn-sm" (click)="goToUpload(c.id)">
              📎 Upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClaimTrackingComponent implements OnInit {
  claims: Claim[] = [];

  constructor(
    private claimService: ClaimService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId()!;
    this.claimService.getCustomerClaims(userId).subscribe(c => this.claims = c);
  }

  goToUpload(claimId: number): void {
    this.router.navigate(['/customer/upload-documents', claimId]);
  }
}
