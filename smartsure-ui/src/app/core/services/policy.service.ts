import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BuyPolicyRequest, Policy, PolicyType, PremiumCalculation, PremiumResult } from '../models/policy.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly baseUrl = environment.gatewayUrl;

  constructor(private http: HttpClient) {}

  getPolicyTypes(): Observable<PolicyType[]> {
    return this.http.get<PolicyType[]>(`${this.baseUrl}/gateway/policy-types`);
  }

  createPolicyType(data: Partial<PolicyType>): Observable<PolicyType> {
    return this.http.post<PolicyType>(`${this.baseUrl}/gateway/policy-types`, data);
  }

  calculatePremium(data: PremiumCalculation): Observable<PremiumResult> {
    return this.http.post<PremiumResult>(`${this.baseUrl}/gateway/policy-types/calculate-premium`, data);
  }

  buyPolicy(data: BuyPolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(`${this.baseUrl}/gateway/policies/buy`, data);
  }

  getCustomerPolicies(customerId: number): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.baseUrl}/gateway/policies/customer/${customerId}`);
  }

  getPolicyById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.baseUrl}/gateway/policies/${id}`);
  }

  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.baseUrl}/gateway/policies`);
  }

  updatePolicyStatus(id: number, status: string): Observable<Policy> {
    return this.http.patch<Policy>(`${this.baseUrl}/gateway/policies/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  activatePolicy(id: number, customerId: number): Observable<Policy> {
    return this.http.post<Policy>(`${this.baseUrl}/gateway/policies/${id}/activate`, customerId);
  }
}
