import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateReportRequest, DashboardStats, Report } from '../models/report.models';
import { environment } from '../../../environments/environment';
import { User } from '../models/auth.models';
import { Policy, PolicyType } from '../models/policy.models';
import { Claim, UpdateClaimStatus } from '../models/claim.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.gatewayUrl}/gateway/admin`;

  constructor(private http: HttpClient) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }

  // ─── Reports ──────────────────────────────────────────────────────────────
  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/reports`);
  }

  generateReport(data: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(`${this.baseUrl}/reports`, data);
  }

  // ─── Claims (via Admin Control Plane) ─────────────────────────────────────
  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.baseUrl}/claims`);
  }

  updateClaimStatus(id: number, data: UpdateClaimStatus): Observable<Claim> {
    return this.http.patch<Claim>(`${this.baseUrl}/claims/${id}/status`, data);
  }

  getClaimDocuments(claimId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/claims/${claimId}/documents`);
  }

  // ─── Policy Types (via Admin Control Plane) ───────────────────────────────
  getPolicyTypes(): Observable<PolicyType[]> {
    return this.http.get<PolicyType[]>(`${this.baseUrl}/policy-types`);
  }

  createPolicyType(data: Partial<PolicyType>): Observable<PolicyType> {
    return this.http.post<PolicyType>(`${this.baseUrl}/policy-types`, data);
  }

  deletePolicyType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/policy-types/${id}`);
  }

  // ─── Users (via Admin Control Plane) ─────────────────────────────────────
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/status`, isActive);
  }
}
