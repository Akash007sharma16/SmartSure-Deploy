import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { ClaimDocument } from '../../core/models/claim.models';

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.css']
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
