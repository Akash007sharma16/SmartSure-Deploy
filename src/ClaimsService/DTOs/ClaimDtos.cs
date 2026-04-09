namespace ClaimsService.DTOs;

public record InitiateClaimDto(int CustomerId, int PolicyId, string Description, decimal ClaimAmount);
public record ClaimDto(int Id, int CustomerId, int PolicyId, string Description,
    decimal ClaimAmount, string Status, string? AdminRemarks, DateTime CreatedAt);
public record ClaimDocumentDto(int Id, int ClaimId, string FileName, string FileType, DateTime UploadedAt);
public record UpdateClaimStatusDto(string Status, string? AdminRemarks);
