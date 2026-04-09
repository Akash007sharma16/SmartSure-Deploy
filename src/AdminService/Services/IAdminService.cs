using AdminService.DTOs;

namespace AdminService.Services;

public interface IAdminService
{
    Task<IEnumerable<ReportDto>> GetReportsAsync();
    Task<ReportDto> GenerateReportAsync(CreateReportDto dto);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
