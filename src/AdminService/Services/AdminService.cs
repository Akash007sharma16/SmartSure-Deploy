using System.Net.Http.Json;
using System.Text.Json;
using AdminService.DTOs;
using AdminService.Models;
using AdminService.Repositories;

namespace AdminService.Services;

public class AdminService : IAdminService
{
    private readonly IReportRepository _repo;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;

    public AdminService(IReportRepository repo, IHttpClientFactory httpFactory, IConfiguration config)
    {
        _repo = repo;
        _httpFactory = httpFactory;
        _config = config;
    }

    public async Task<IEnumerable<ReportDto>> GetReportsAsync()
    {
        var reports = await _repo.GetAllAsync();
        return reports.Select(r => new ReportDto(r.Id, r.Title, r.ReportType, r.GeneratedBy, r.GeneratedAt));
    }

    public async Task<ReportDto> GenerateReportAsync(CreateReportDto dto)
    {
        var report = new Report
        {
            Title = dto.Title,
            ReportType = dto.ReportType,
            GeneratedBy = dto.GeneratedBy,
            Data = JsonSerializer.Serialize(new { GeneratedAt = DateTime.UtcNow, Type = dto.ReportType })
        };
        await _repo.CreateAsync(report);
        return new ReportDto(report.Id, report.Title, report.ReportType, report.GeneratedBy, report.GeneratedAt);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var internalKey = _config["InternalApi:Key"]!;
        var identityUrl = _config["ServiceUrls:IdentityService"]!;
        var policyUrl = _config["ServiceUrls:PolicyService"]!;
        var claimsUrl = _config["ServiceUrls:ClaimsService"]!;

        var client = _httpFactory.CreateClient("InternalClient");

        int totalUsers = 0, totalPolicies = 0, totalClaims = 0, pendingClaims = 0;

        try
        {
            using var req1 = new HttpRequestMessage(HttpMethod.Get, $"{identityUrl}/api/internal/users/count");
            req1.Headers.Add("X-Internal-Key", internalKey);
            var res1 = await client.SendAsync(req1);
            if (res1.IsSuccessStatusCode)
                totalUsers = await res1.Content.ReadFromJsonAsync<int>();
        }
        catch { /* service unavailable — return 0 */ }

        try
        {
            using var req2 = new HttpRequestMessage(HttpMethod.Get, $"{policyUrl}/api/internal/policies/count");
            req2.Headers.Add("X-Internal-Key", internalKey);
            var res2 = await client.SendAsync(req2);
            if (res2.IsSuccessStatusCode)
                totalPolicies = await res2.Content.ReadFromJsonAsync<int>();
        }
        catch { }

        try
        {
            using var req3 = new HttpRequestMessage(HttpMethod.Get, $"{claimsUrl}/api/internal/claims/count");
            req3.Headers.Add("X-Internal-Key", internalKey);
            var res3 = await client.SendAsync(req3);
            if (res3.IsSuccessStatusCode)
                totalClaims = await res3.Content.ReadFromJsonAsync<int>();
        }
        catch { }

        try
        {
            using var req4 = new HttpRequestMessage(HttpMethod.Get, $"{claimsUrl}/api/internal/claims/pending/count");
            req4.Headers.Add("X-Internal-Key", internalKey);
            var res4 = await client.SendAsync(req4);
            if (res4.IsSuccessStatusCode)
                pendingClaims = await res4.Content.ReadFromJsonAsync<int>();
        }
        catch { }

        return new DashboardStatsDto(totalUsers, totalPolicies, totalClaims, pendingClaims);
    }
}
