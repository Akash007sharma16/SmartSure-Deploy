export interface PolicyType {
  id: number;
  name: string;
  description: string;
  baseRate: number;
  isActive: boolean;
}

export interface Policy {
  id: number;
  customerId: number;
  policyNumber: string;
  policyType: string;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  premiumAmount: number;
}

export interface BuyPolicyRequest {
  customerId: number;
  policyTypeId: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
}

export interface PremiumCalculation {
  policyTypeId: number;
  coverageAmount: number;
}

export interface PremiumResult {
  policyId: number;
  amount: number;
  calculatedAt: string;
}
