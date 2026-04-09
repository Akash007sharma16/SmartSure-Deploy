import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim, ClaimDocument, InitiateClaimRequest, UpdateClaimStatus } from '../models/claim.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly baseUrl = `${environment.gatewayUrl}/gateway/claims`;

  constructor(private http: HttpClient) {}

  initiateClaim(data: InitiateClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(this.baseUrl, data);
  }

  submitClaim(id: number): Observable<Claim> {
    return this.http.post<Claim>(`${this.baseUrl}/${id}/submit`, {});
  }

  getCustomerClaims(customerId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.baseUrl}/${id}`);
  }

  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.baseUrl);
  }

  updateClaimStatus(id: number, data: UpdateClaimStatus): Observable<Claim> {
    return this.http.patch<Claim>(`${this.baseUrl}/${id}/status`, data);
  }

  uploadDocument(claimId: number, file: File): Observable<ClaimDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClaimDocument>(`${this.baseUrl}/${claimId}/documents`, formData);
  }

  getDocuments(claimId: number): Observable<ClaimDocument[]> {
    return this.http.get<ClaimDocument[]>(`${this.baseUrl}/${claimId}/documents`);
  }
}
