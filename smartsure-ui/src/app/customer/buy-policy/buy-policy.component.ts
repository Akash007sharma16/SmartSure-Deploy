import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { AuthService } from '../../core/services/auth.service';
import { PolicyType } from '../../core/models/policy.models';

@Component({
  selector: 'app-buy-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="wizard-container">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:0.25rem;">Buy Insurance Policy</h2>
        <p style="color:#64748b; font-size:0.875rem;">Complete the steps below to get covered</p>
      </div>

      <!-- Connected-dots Stepper -->
      <div class="stepper">
        <div class="step" [class.active]="step === 1" [class.done]="step > 1">
          <div class="step-circle">{{ step > 1 ? '✓' : '1' }}</div>
          <div class="step-label">Select Type</div>
        </div>
        <div class="step" [class.active]="step === 2" [class.done]="step > 2">
          <div class="step-circle">{{ step > 2 ? '✓' : '2' }}</div>
          <div class="step-label">Coverage Details</div>
        </div>
        <div class="step" [class.active]="step === 3">
          <div class="step-circle">3</div>
          <div class="step-label">Confirm</div>
        </div>
      </div>

      <!-- Step 1: Select Policy Type -->
      <div *ngIf="step === 1">
        <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1.25rem;">Choose a policy type</h3>
        <div class="policy-types">
          <div *ngFor="let pt of policyTypes" class="policy-type-card"
               [class.selected]="selectedTypeId === pt.id" (click)="selectType(pt)">
            <div class="check-mark">✓</div>
            <div class="type-icon">🛡️</div>
            <h4>{{ pt.name }}</h4>
            <p>{{ pt.description }}</p>
            <span class="type-rate">{{ pt.baseRate }}% base rate</span>
          </div>
        </div>
        <div *ngIf="policyTypes.length === 0" class="empty-state" style="padding:2rem;">
          <div class="spinner"></div>
          <p>Loading policy types...</p>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
          <button class="btn btn-primary" [disabled]="!selectedTypeId" (click)="step = 2">
            Continue →
          </button>
        </div>
      </div>

      <!-- Step 2: Coverage Details -->
      <div *ngIf="step === 2">
        <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1.25rem;">Coverage details</h3>
        <form [formGroup]="detailsForm">
          <div class="form-group">
            <label>Coverage Amount</label>
            <div class="input-wrapper">
              <span class="input-icon">💵</span>
              <input type="number" formControlName="coverageAmount" class="form-control"
                     placeholder="e.g. 50000" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" formControlName="startDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" formControlName="endDate" class="form-control" />
            </div>
          </div>
          <div *ngIf="estimatedPremium" class="premium-estimate">
            <div style="font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; color:#065f46;">Estimated Premium</div>
            <strong style="font-size:1.75rem; color:#059669;">{{ estimatedPremium | currency }}</strong>
            <div style="font-size:0.75rem; margin-top:0.25rem; color:#047857;">Based on {{ selectedType?.baseRate }}% of coverage amount</div>
          </div>
        </form>
        <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
          <button class="btn btn-secondary" (click)="step = 1">← Back</button>
          <button class="btn btn-primary" [disabled]="detailsForm.invalid" (click)="calculateAndNext()">
            Calculate &amp; Continue →
          </button>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div *ngIf="step === 3">
        <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1.25rem;">Review &amp; confirm</h3>
        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">Policy Type</span>
            <span class="summary-value">{{ selectedType?.name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Coverage Amount</span>
            <span class="summary-value">{{ detailsForm.value.coverageAmount | currency }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Start Date</span>
            <span class="summary-value">{{ detailsForm.value.startDate | date:'mediumDate' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">End Date</span>
            <span class="summary-value">{{ detailsForm.value.endDate | date:'mediumDate' }}</span>
          </div>
          <div class="summary-row summary-total">
            <span class="summary-label" style="font-weight:700;">Total Premium</span>
            <span class="summary-value" style="font-size:1.5rem; color:#1e40af; font-weight:800;">{{ estimatedPremium | currency }}</span>
          </div>
        </div>
        <div *ngIf="errorMsg" class="alert alert-danger">⚠️ {{ errorMsg }}</div>
        <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
          <button class="btn btn-secondary" (click)="step = 2">← Back</button>
          <button class="btn btn-success" [disabled]="loading" (click)="confirmPurchase()">
            {{ loading ? '⏳ Processing...' : '✅ Confirm Purchase' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .summary-value { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .summary-total {
      background: linear-gradient(135deg, rgba(30,64,175,0.04), rgba(59,130,246,0.04));
      padding: 1.25rem;
    }
  `]
})
export class BuyPolicyComponent implements OnInit {
  step = 1;
  policyTypes: PolicyType[] = [];
  selectedTypeId: number | null = null;
  selectedType: PolicyType | null = null;
  estimatedPremium: number | null = null;
  loading = false;
  errorMsg = '';

  detailsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.detailsForm = this.fb.group({
      coverageAmount: [50000, [Validators.required, Validators.min(1000)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.policyService.getPolicyTypes().subscribe(types => this.policyTypes = types);
  }

  selectType(pt: PolicyType): void {
    this.selectedTypeId = pt.id;
    this.selectedType = pt;
  }

  calculateAndNext(): void {
    if (!this.selectedTypeId) return;
    this.policyService.calculatePremium({
      policyTypeId: this.selectedTypeId,
      coverageAmount: this.detailsForm.value.coverageAmount
    }).subscribe(result => {
      this.estimatedPremium = result.amount;
      this.step = 3;
    });
  }

  confirmPurchase(): void {
    this.loading = true;
    this.errorMsg = '';
    const userId = this.authService.getUserId()!;

    this.policyService.buyPolicy({
      customerId: userId,
      policyTypeId: this.selectedTypeId!,
      coverageAmount: this.detailsForm.value.coverageAmount,
      startDate: this.detailsForm.value.startDate,
      endDate: this.detailsForm.value.endDate
    }).subscribe({
      next: (policy) => {
        this.policyService.activatePolicy(policy.id, userId).subscribe({
          next: () => { this.loading = false; this.router.navigate(['/customer/policies']); },
          error: () => {
            this.loading = false;
            this.router.navigate(['/customer/policies']);
          }
        });
      },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.message || 'Purchase failed.'; }
    });
  }
}
