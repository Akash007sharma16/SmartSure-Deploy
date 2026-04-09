using ClaimsService.DTOs;

namespace ClaimsService.Services;

public interface IClaimService
{
    Task<ClaimDto> InitiateClaimAsync(InitiateClaimDto dto);
    Task<ClaimDto> SubmitClaimAsync(int claimId);
    Task<IEnumerable<ClaimDto>> GetCustomerClaimsAsync(int customerId);
    Task<ClaimDto?> GetClaimByIdAsync(int id);
    Task<IEnumerable<ClaimDto>> GetAllClaimsAsync();
    Task<ClaimDto> UpdateClaimStatusAsync(int id, UpdateClaimStatusDto dto);
    Task<ClaimDocumentDto> UploadDocumentAsync(int claimId, IFormFile file);
    Task<IEnumerable<ClaimDocumentDto>> GetDocumentsAsync(int claimId);
}
