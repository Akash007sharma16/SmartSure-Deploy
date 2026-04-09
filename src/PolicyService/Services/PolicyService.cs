using PolicyService.DTOs;
using PolicyService.Models;
using PolicyService.Repositories;

namespace PolicyService.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _policyRepo;
    private readonly IPolicyTypeRepository _typeRepo;
    private readonly IPremiumRepository _premiumRepo;
    private readonly IPaymentRepository _paymentRepo;

    public PolicyService(
        IPolicyRepository policyRepo,
        IPolicyTypeRepository typeRepo,
        IPremiumRepository premiumRepo,
        IPaymentRepository paymentRepo)
    {
        _policyRepo = policyRepo;
        _typeRepo = typeRepo;
        _premiumRepo = premiumRepo;
        _paymentRepo = paymentRepo;
    }

    public async Task<IEnumerable<PolicyTypeDto>> GetPolicyTypesAsync()
    {
        var types = await _typeRepo.GetAllAsync();
        return types.Select(t => new PolicyTypeDto(t.Id, t.Name, t.Description, t.BaseRate, t.IsActive));
    }

    public async Task<PolicyTypeDto> CreatePolicyTypeAsync(CreatePolicyTypeDto dto)
    {
        var pt = new PolicyType { Name = dto.Name, Description = dto.Description, BaseRate = dto.BaseRate };
        await _typeRepo.CreateAsync(pt);
        return new PolicyTypeDto(pt.Id, pt.Name, pt.Description, pt.BaseRate, pt.IsActive);
    }

    public async Task<PolicyDto> BuyPolicyAsync(BuyPolicyDto dto)
    {
        var policyType = await _typeRepo.GetByIdAsync(dto.PolicyTypeId)
            ?? throw new KeyNotFoundException("Policy type not found.");

        var policy = new Policy
        {
            CustomerId = dto.CustomerId,
            PolicyTypeId = dto.PolicyTypeId,
            PolicyNumber = $"POL-{DateTime.UtcNow.Ticks}",
            CoverageAmount = dto.CoverageAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = PolicyStatus.Draft
        };

        await _policyRepo.CreateAsync(policy);

        var premiumAmount = dto.CoverageAmount * (policyType.BaseRate / 100);
        await _premiumRepo.CreateAsync(new Premium { PolicyId = policy.Id, Amount = premiumAmount });

        return MapToDto(policy, policyType.Name);
    }

    public async Task<PolicyDto> ActivatePolicyAsync(int id, int customerId)
    {
        var policy = await _policyRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (policy.CustomerId != customerId)
            throw new UnauthorizedAccessException("Not your policy.");

        if (policy.Status != PolicyStatus.Draft)
            throw new InvalidOperationException("Only Draft policies can be activated.");

        policy.Status = PolicyStatus.Active;
        await _policyRepo.UpdateAsync(policy);

        // FIX 7: Record payment when policy is activated
        var premium = policy.Premiums.OrderByDescending(p => p.CalculatedAt).FirstOrDefault();
        if (premium != null)
        {
            await _paymentRepo.CreateAsync(new Payment
            {
                PolicyId = policy.Id,
                Amount = premium.Amount,
                Status = PaymentStatus.Completed,
                PaidAt = DateTime.UtcNow
            });
        }

        return MapToDto(policy, policy.PolicyType.Name);
    }

    public async Task<IEnumerable<PolicyDto>> GetCustomerPoliciesAsync(int customerId)
    {
        var policies = await _policyRepo.GetByCustomerIdAsync(customerId);
        return policies.Select(p => MapToDto(p, p.PolicyType.Name));
    }

    public async Task<PolicyDto?> GetPolicyByIdAsync(int id)
    {
        var p = await _policyRepo.GetByIdAsync(id);
        if (p == null) return null;
        if (p.Status == PolicyStatus.Active && p.EndDate < DateTime.UtcNow)
        {
            p.Status = PolicyStatus.Expired;
            await _policyRepo.UpdateAsync(p);
        }
        return MapToDto(p, p.PolicyType.Name);
    }

    public async Task<IEnumerable<PolicyDto>> GetAllPoliciesAsync()
    {
        var policies = await _policyRepo.GetAllAsync();
        foreach (var p in policies.Where(p => p.Status == PolicyStatus.Active && p.EndDate < DateTime.UtcNow))
        {
            p.Status = PolicyStatus.Expired;
            await _policyRepo.UpdateAsync(p);
        }
        return policies.Select(p => MapToDto(p, p.PolicyType.Name));
    }

    public async Task<PolicyDto> UpdatePolicyStatusAsync(int id, string status)
    {
        var policy = await _policyRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (!Enum.TryParse<PolicyStatus>(status, true, out var newStatus))
            throw new ArgumentException("Invalid status.");

        policy.Status = newStatus;
        await _policyRepo.UpdateAsync(policy);
        return MapToDto(policy, policy.PolicyType.Name);
    }

    public async Task<PremiumDto> CalculatePremiumAsync(PremiumCalculationDto dto)
    {
        var policyType = await _typeRepo.GetByIdAsync(dto.PolicyTypeId)
            ?? throw new KeyNotFoundException("Policy type not found.");

        var amount = dto.CoverageAmount * (policyType.BaseRate / 100);
        return new PremiumDto(0, amount, DateTime.UtcNow);
    }

    private static PolicyDto MapToDto(Policy p, string typeName) =>
        new(p.Id, p.CustomerId, p.PolicyNumber, typeName,
            p.CoverageAmount, p.StartDate, p.EndDate, p.Status.ToString(), p.CreatedAt,
            p.Premiums.OrderByDescending(pr => pr.CalculatedAt).FirstOrDefault()?.Amount ?? 0);
}
