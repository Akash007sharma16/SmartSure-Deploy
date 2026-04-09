export interface Report {
  id: number;
  title: string;
  reportType: string;
  generatedBy: number;
  generatedAt: string;
}

export interface CreateReportRequest {
  title: string;
  reportType: string;
  generatedBy: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalPolicies: number;
  totalClaims: number;
  pendingClaims: number;
}
