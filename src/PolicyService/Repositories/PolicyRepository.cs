using Microsoft.EntityFrameworkCore;
using PolicyService.Data;
using PolicyService.Models;

namespace PolicyService.Repositories;

public class PolicyRepository : IPolicyRepository
{
    private readonly PolicyDbContext _ctx;
    public PolicyRepository(PolicyDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Policy>> GetByCustomerIdAsync(int customerId) =>
        await _ctx.Policies
            .Include(p => p.PolicyType)
            .Include(p => p.Premiums)
            .Where(p => p.CustomerId == customerId)
            .ToListAsync();

    public async Task<Policy?> GetByIdAsync(int id) =>
        await _ctx.Policies
            .Include(p => p.PolicyType)
            .Include(p => p.Premiums)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Policy>> GetAllAsync() =>
        await _ctx.Policies
            .Include(p => p.PolicyType)
            .Include(p => p.Premiums)
            .ToListAsync();

    public async Task<Policy> CreateAsync(Policy policy)
    {
        _ctx.Policies.Add(policy);
        await _ctx.SaveChangesAsync();
        return policy;
    }

    public async Task<Policy> UpdateAsync(Policy policy)
    {
        _ctx.Policies.Update(policy);
        await _ctx.SaveChangesAsync();
        return policy;
    }
}

public class PolicyTypeRepository : IPolicyTypeRepository
{
    private readonly PolicyDbContext _ctx;
    public PolicyTypeRepository(PolicyDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<PolicyType>> GetAllAsync() =>
        await _ctx.PolicyTypes.Where(pt => pt.IsActive).ToListAsync();

    public async Task<PolicyType?> GetByIdAsync(int id) =>
        await _ctx.PolicyTypes.FindAsync(id);

    public async Task<PolicyType> CreateAsync(PolicyType pt)
    {
        _ctx.PolicyTypes.Add(pt);
        await _ctx.SaveChangesAsync();
        return pt;
    }

    public async Task<PolicyType> UpdateAsync(PolicyType pt)
    {
        _ctx.PolicyTypes.Update(pt);
        await _ctx.SaveChangesAsync();
        return pt;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var pt = await _ctx.PolicyTypes.FindAsync(id);
        if (pt == null) return false;
        // Soft delete — mark inactive so existing policies referencing it still work
        pt.IsActive = false;
        _ctx.PolicyTypes.Update(pt);
        await _ctx.SaveChangesAsync();
        return true;
    }
}

public class PremiumRepository : IPremiumRepository
{
    private readonly PolicyDbContext _ctx;
    public PremiumRepository(PolicyDbContext ctx) => _ctx = ctx;

    public async Task<Premium?> GetByPolicyIdAsync(int policyId) =>
        await _ctx.Premiums.FirstOrDefaultAsync(p => p.PolicyId == policyId);

    public async Task<Premium> CreateAsync(Premium premium)
    {
        _ctx.Premiums.Add(premium);
        await _ctx.SaveChangesAsync();
        return premium;
    }
}

public class PaymentRepository : IPaymentRepository
{
    private readonly PolicyDbContext _ctx;
    public PaymentRepository(PolicyDbContext ctx) => _ctx = ctx;

    public async Task<Payment> CreateAsync(Payment payment)
    {
        _ctx.Payments.Add(payment);
        await _ctx.SaveChangesAsync();
        return payment;
    }
}
