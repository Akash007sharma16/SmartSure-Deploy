export interface Claim {
  id: number;
  customerId: number;
  policyId: number;
  description: string;
  claimAmount: number;
  status: string;
  adminRemarks?: string;
  createdAt: string;
}

export interface InitiateClaimRequest {
  customerId: number;
  policyId: number;
  description: string;
  claimAmount: number;
}

export interface ClaimDocument {
  id: number;
  claimId: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface UpdateClaimStatus {
  status: string;
  adminRemarks?: string;
}
