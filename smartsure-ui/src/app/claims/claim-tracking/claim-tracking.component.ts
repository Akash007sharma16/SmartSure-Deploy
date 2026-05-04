import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { Claim } from '../../core/models/claim.models';

@Component({
  selector: 'app-claim-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './claim-tracking.component.html',
  styleUrls: ['./claim-tracking.component.css']
})
export class ClaimTrackingComponent implements OnInit {
  claims: Claim[] = [];

  badge(status: string | undefined): string {
    return 'ct-badge-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  barClass(status: string | undefined): string {
    return 'ct-bar-' + (status ?? 'draft').toLowerCase().replace(' ', '');
  }

  iconClass(status: string | undefined): string {
    const map: Record<string, string> = {
      draft: 'ct-icon-grey', submitted: 'ct-icon-blue',
      underreview: 'ct-icon-orange', approved: 'ct-icon-green',
      rejected: 'ct-icon-red', closed: 'ct-icon-grey'
    };
    return map[(status ?? 'draft').toLowerCase().replace(' ', '')] ?? 'ct-icon-grey';
  }

  constructor(
    private claimService: ClaimService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.claimService.getCustomerClaims(this.authService.getUserId()!).subscribe({
      next: c => this.claims = c ?? [],
      error: () => this.claims = []
    });
  }

  goToUpload(id: number): void {
    this.router.navigate(['/customer/upload-documents', id]);
  }
}
