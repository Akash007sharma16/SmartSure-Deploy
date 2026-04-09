using ClaimsService.Data;
using ClaimsService.Models;
using Microsoft.EntityFrameworkCore;

namespace ClaimsService.Repositories;

public class ClaimRepository : IClaimRepository
{
    private readonly ClaimsDbContext _ctx;
    public ClaimRepository(ClaimsDbContext ctx) => _ctx = ctx;

    public async Task<Claim?> GetByIdAsync(int id) =>
        await _ctx.Claims.Include(c => c.Documents).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Claim>> GetByCustomerIdAsync(int customerId) =>
        await _ctx.Claims.Include(c => c.Documents).Where(c => c.CustomerId == customerId).ToListAsync();

    public async Task<IEnumerable<Claim>> GetAllAsync() =>
        await _ctx.Claims.Include(c => c.Documents).ToListAsync();

    public async Task<Claim> CreateAsync(Claim claim)
    {
        _ctx.Claims.Add(claim);
        await _ctx.SaveChangesAsync();
        return claim;
    }

    public async Task<Claim> UpdateAsync(Claim claim)
    {
        _ctx.Claims.Update(claim);
        await _ctx.SaveChangesAsync();
        return claim;
    }

    public async Task<ClaimDocument> AddDocumentAsync(ClaimDocument doc)
    {
        _ctx.ClaimDocuments.Add(doc);
        await _ctx.SaveChangesAsync();
        return doc;
    }

    public async Task<IEnumerable<ClaimDocument>> GetDocumentsByClaimIdAsync(int claimId) =>
        await _ctx.ClaimDocuments.Where(d => d.ClaimId == claimId).ToListAsync();
}
