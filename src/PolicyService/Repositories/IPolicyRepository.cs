using PolicyService.Models;

namespace PolicyService.Repositories;

public interface IPolicyRepository
{
    Task<IEnumerable<Policy>> GetByCustomerIdAsync(int customerId);
    Task<Policy?> GetByIdAsync(int id);
    Task<IEnumerable<Policy>> GetAllAsync();
    Task<Policy> CreateAsync(Policy policy);
    Task<Policy> UpdateAsync(Policy policy);
}

public interface IPolicyTypeRepository
{
    Task<IEnumerable<PolicyType>> GetAllAsync();
    Task<PolicyType?> GetByIdAsync(int id);
    Task<PolicyType> CreateAsync(PolicyType policyType);
    Task<PolicyType> UpdateAsync(PolicyType policyType);
    Task<bool> DeleteAsync(int id);
}

public interface IPremiumRepository
{
    Task<Premium?> GetByPolicyIdAsync(int policyId);
    Task<Premium> CreateAsync(Premium premium);
}

public interface IPaymentRepository
{
    Task<Payment> CreateAsync(Payment payment);
}
