import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { Policy } from '../../core/models/policy.models';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.css']
})
export class PolicyDetailComponent implements OnInit {
  policy: Policy | null = null;
  loading = true;
  activating = false;

  badge(status: string | undefined): string {
    return 'ss-badge-' + (status ?? 'draft').toLowerCase();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.policyService.getPolicyById(id).subscribe({
      next: p => { this.policy = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  activatePolicy(): void {
    if (!this.policy) return;
    this.activating = true;
    this.policyService.activatePolicy(this.policy.id, this.authService.getUserId()!).subscribe({
      next: p => { this.policy = p; this.activating = false; },
      error: () => { this.activating = false; }
    });
  }
}
