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
    <div class="page-container">
      <div class="page-header">
        <h2>Upload Documents</h2>
        <a routerLink="/claims/track" class="btn btn-secondary">← Back to Claims</a>
      </div>
      <p>Claim ID: <strong>{{ claimId }}</strong></p>
      <div class="upload-area">
        <input type="file" (change)="onFileSelected($event)" class="form-control" accept=".pdf,.jpg,.png,.doc,.docx" />
        <button class="btn btn-primary" [disabled]="!selectedFile || uploading" (click)="upload()">
          {{ uploading ? 'Uploading...' : 'Upload Document' }}
        </button>
      </div>
      <div *ngIf="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
      <div *ngIf="successMsg" class="alert alert-success">{{ successMsg }}</div>
      <div class="documents-list" *ngIf="documents.length > 0">
        <h3>Uploaded Documents</h3>
        <table class="table">
          <thead><tr><th>File Name</th><th>Type</th><th>Uploaded At</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of documents">
              <td>{{ d.fileName }}</td>
              <td>{{ d.fileType }}</td>
              <td>{{ d.uploadedAt | date:'medium' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .upload-area { display: flex; gap: 1rem; align-items: center; margin: 1.5rem 0; flex-wrap: wrap; }
    .alert-success { background: #d4edda; color: #155724; padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0; }
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
    this.claimService.getDocuments(this.claimId).subscribe(d => this.documents = d);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.claimService.uploadDocument(this.claimId, this.selectedFile).subscribe({
      next: (doc) => {
        this.documents.push(doc);
        this.selectedFile = null;
        this.uploading = false;
        this.successMsg = `"${doc.fileName}" uploaded successfully.`;
      },
      error: (err) => {
        this.uploading = false;
        this.errorMsg = err.error?.message || 'Upload failed.';
      }
    });
  }
}
