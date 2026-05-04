using System.ComponentModel.DataAnnotations;

namespace AdminService.DTOs;

public record ReportDto(int Id, string Title, string ReportType, int GeneratedBy, DateTime GeneratedAt);

public record CreateReportDto(
    [Required(ErrorMessage = "Report title is required.")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 100 characters.")]
    [RegularExpression(@"^[^@#$%^&*<>{}|\\]+$", ErrorMessage = "Title cannot contain special characters like @#$%.")]
    string Title,

    [Required(ErrorMessage = "Report type is required.")]
    [RegularExpression(@"^(Claims|Policies|Users)$", ErrorMessage = "Report type must be Claims, Policies, or Users.")]
    string ReportType,

    [Required] int GeneratedBy
);

public record DashboardStatsDto(int TotalUsers, int TotalPolicies, int TotalClaims, int PendingClaims);

public record UpdateClaimStatusRequest(
    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression(@"^(UnderReview|Approved|Rejected|Closed)$",
        ErrorMessage = "Invalid status value.")]
    string Status,

    [StringLength(500)] string? AdminRemarks
);
