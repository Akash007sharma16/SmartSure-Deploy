using AdminService.Data;
using AdminService.Models;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AdminDbContext _ctx;
    public ReportRepository(AdminDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Report>> GetAllAsync() =>
        await _ctx.Reports.OrderByDescending(r => r.GeneratedAt).ToListAsync();

    public async Task<Report?> GetByIdAsync(int id) =>
        await _ctx.Reports.FindAsync(id);

    public async Task<Report> CreateAsync(Report report)
    {
        _ctx.Reports.Add(report);
        await _ctx.SaveChangesAsync();
        return report;
    }
}
