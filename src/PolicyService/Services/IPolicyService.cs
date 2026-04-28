using PolicyService.DTOs;

namespace PolicyService.Services;

public interface IPolicyService
{
    Task<IEnumerable<PolicyTypeDto>> GetPolicyTypesAsync();
    Task<PolicyTypeDto> CreatePolicyTypeAsync(CreatePolicyTypeDto dto);
    Task<bool> DeletePolicyTypeAsync(int id);
    Task<PolicyDto> BuyPolicyAsync(BuyPolicyDto dto);
    Task<PolicyDto> ActivatePolicyAsync(int id, int customerId);
    Task<IEnumerable<PolicyDto>> GetCustomerPoliciesAsync(int customerId);
    Task<PolicyDto?> GetPolicyByIdAsync(int id);
    Task<IEnumerable<PolicyDto>> GetAllPoliciesAsync();
    Task<PolicyDto> UpdatePolicyStatusAsync(int id, string status);
    Task<PremiumDto> CalculatePremiumAsync(PremiumCalculationDto dto);
}
