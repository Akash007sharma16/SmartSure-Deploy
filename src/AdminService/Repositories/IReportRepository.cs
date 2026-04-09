using AdminService.Models;

namespace AdminService.Repositories;

public interface IReportRepository
{
    Task<IEnumerable<Report>> GetAllAsync();
    Task<Report?> GetByIdAsync(int id);
    Task<Report> CreateAsync(Report report);
}
