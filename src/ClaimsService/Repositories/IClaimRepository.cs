using ClaimsService.Models;

namespace ClaimsService.Repositories;

public interface IClaimRepository
{
    Task<Claim?> GetByIdAsync(int id);
    Task<IEnumerable<Claim>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Claim>> GetAllAsync();
    Task<Claim> CreateAsync(Claim claim);
    Task<Claim> UpdateAsync(Claim claim);
    Task<ClaimDocument> AddDocumentAsync(ClaimDocument doc);
    Task<IEnumerable<ClaimDocument>> GetDocumentsByClaimIdAsync(int claimId);
}
