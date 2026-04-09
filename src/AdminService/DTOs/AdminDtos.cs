namespace AdminService.DTOs;

public record ReportDto(int Id, string Title, string ReportType, int GeneratedBy, DateTime GeneratedAt);
public record CreateReportDto(string Title, string ReportType, int GeneratedBy);
public record DashboardStatsDto(int TotalUsers, int TotalPolicies, int TotalClaims, int PendingClaims);
public record UpdateClaimStatusRequest(string Status, string? AdminRemarks);
