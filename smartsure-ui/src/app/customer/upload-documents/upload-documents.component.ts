import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { ClaimDocument } from '../../core/models/claim.models';

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div>
    <div class="ss-page-header mb-4">
      <div>
        <h2 class="ss-page-title">Upload Documents</h2>
        <p class="ss-page-sub">Claim #{{ claimId }} · Upload supporting documents</p>
      </div>
      <a routerLink="/claims/track" class="btn btn-outline-secondary">← Back to Claims</a>
    </div>

    <div class="row g-4">
      <!-- Upload Area -->
      <div class="col-lg-6">
        <div class="ss-upload-card">
          <div class="ss-upload-header">Upload New Document</div>
          <div class="ss-upload-body">
            <div class="ss-drop-zone" [class.ss-dz-active]="selectedFile" (click)="fileInput.click()">
              <input #fileInput type="file" hidden (change)="onFileSelected($event)" accept=".pdf,.jpg,.png,.doc,.docx" />
              <div *ngIf="!selectedFile">
                <div class="ss-dz-icon">📎</div>
                <div class="ss-dz-title">Click to select a file</div>
                <div class="ss-dz-sub">PDF, JPG, PNG, DOC up to 10MB</div>
              </div>
              <div *ngIf="selectedFile" class="ss-dz-selected">
                <div class="ss-dz-file-icon">📄</div>
                <div>
                  <div class="ss-dz-file-name">{{ selectedFile.name }}</div>
                  <div class="ss-dz-file-size">{{ (selectedFile.size / 1024).toFixed(1) }} KB</div>
                </div>
                <button class="ss-dz-remove" (click)="$event.stopPropagation(); selectedFile=null">✕</button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="alert alert-danger mt-3">⚠️ {{ errorMsg }}</div>
            <div *ngIf="successMsg" class="alert alert-success mt-3">✅ {{ successMsg }}</div>

            <button class="btn btn-primary w-100 mt-3" [disabled]="!selectedFile || uploading" (click)="upload()">
              <span *ngIf="uploading" class="spinner-border spinner-border-sm me-2"></span>
              {{ uploading ? 'Uploading...' : '⬆ Upload Document' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div class="col-lg-6">
        <div class="ss-upload-card">
          <div class="ss-upload-header">
            Uploaded Documents
            <span class="badge bg-primary rounded-pill ms-2">{{ documents.length }}</span>
          </div>
          <div class="ss-upload-body">
            <div *ngIf="documents.length === 0" class="ss-empty-inline">
              <div style="font-size:2.5rem; margin-bottom:0.75rem;">📂</div>
              <p class="text-muted">No documents uploaded yet.</p>
            </div>
            <div *ngFor="let d of documents" class="ss-doc-row">
              <div class="ss-doc-icon">📄</div>
              <div class="flex-grow-1">
                <div class="ss-doc-name">{{ d.fileName }}</div>
                <div class="ss-doc-meta">{{ d.fileType }} · {{ d.uploadedAt | date:'MMM d, y · h:mm a' }}</div>
              </div>
              <span class="badge bg-success">Uploaded</span>
            </div>
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
    .ss-upload-card { background:white; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; height:100%; }
    .ss-upload-header { padding:1rem 1.25rem; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:0.875rem; font-weight:800; color:#1e3a5f; display:flex; align-items:center; }
    .ss-upload-body { padding:1.5rem; }
    .ss-drop-zone {
      border:2px dashed #e2e8f0; border-radius:12px; padding:2.5rem 1.5rem;
      text-align:center; cursor:pointer; transition:all 0.2s;
      &:hover { border-color:#2563eb; background:#f0f7ff; }
      &.ss-dz-active { border-color:#16a34a; background:#f0fdf4; }
    }
    .ss-dz-icon { font-size:2.5rem; margin-bottom:0.75rem; }
    .ss-dz-title { font-size:0.95rem; font-weight:700; color:#1e3a5f; margin-bottom:0.375rem; }
    .ss-dz-sub { font-size:0.8rem; color:#94a3b8; }
    .ss-dz-selected { display:flex; align-items:center; gap:1rem; }
    .ss-dz-file-icon { font-size:2rem; flex-shrink:0; }
    .ss-dz-file-name { font-size:0.9rem; font-weight:700; color:#1e3a5f; }
    .ss-dz-file-size { font-size:0.78rem; color:#64748b; }
    .ss-dz-remove { background:none; border:none; color:#dc2626; font-size:1rem; cursor:pointer; margin-left:auto; padding:0.25rem; }
    .ss-doc-row { display:flex; align-items:center; gap:0.875rem; padding:0.875rem 0; border-bottom:1px solid #f1f5f9; &:last-child { border-bottom:none; } }
    .ss-doc-icon { font-size:1.5rem; flex-shrink:0; }
    .ss-doc-name { font-size:0.875rem; font-weight:600; color:#1e293b; }
    .ss-doc-meta { font-size:0.75rem; color:#64748b; margin-top:0.1rem; }
    .ss-empty-inline { text-align:center; padding:2rem 0; }
  `]
})
export class UploadDocumentsComponent implements OnInit {
  claimId = 0;
  selectedFile: File | null = null;
  documents: ClaimDocument[] = [];
  uploading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private route: ActivatedRoute, private claimService: ClaimService) {}

  ngOnInit(): void {
    this.claimId = Number(this.route.snapshot.paramMap.get('claimId'));
    if (this.claimId > 0) {
      this.claimService.getDocuments(this.claimId).subscribe(d => this.documents = d);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading = true; this.errorMsg = ''; this.successMsg = '';
    this.claimService.uploadDocument(this.claimId, this.selectedFile).subscribe({
      next: doc => {
        this.documents.push(doc);
        this.selectedFile = null;
        this.uploading = false;
        this.successMsg = `"${doc.fileName}" uploaded successfully.`;
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: err => { this.uploading = false; this.errorMsg = err.error?.message || 'Upload failed.'; }
    });
  }
}
