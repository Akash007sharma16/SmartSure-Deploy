using System.ComponentModel.DataAnnotations;

namespace ClaimsService.DTOs;

public record InitiateClaimDto(
    [Required] int CustomerId,
    [Required] int PolicyId,

    [Required(ErrorMessage = "Claim description is required.")]
    [StringLength(500, MinimumLength = 15, ErrorMessage = "Description must be between 15 and 500 characters.")]
    string Description,

    [Required(ErrorMessage = "Claim amount is required.")]
    [Range(1, 10000000, ErrorMessage = "Claim amount must be between ₹1 and ₹1,00,00,000.")]
    decimal ClaimAmount
);

public record ClaimDto(
    int Id, int CustomerId, int PolicyId, string Description,
    decimal ClaimAmount, string Status, string? AdminRemarks, DateTime CreatedAt);

public record ClaimDocumentDto(int Id, int ClaimId, string FileName, string FileType, DateTime UploadedAt);

public record UpdateClaimStatusDto(
    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression(@"^(UnderReview|Approved|Rejected|Closed)$",
        ErrorMessage = "Status must be one of: UnderReview, Approved, Rejected, Closed.")]
    string Status,

    [StringLength(500, ErrorMessage = "Admin remarks cannot exceed 500 characters.")]
    string? AdminRemarks
);
