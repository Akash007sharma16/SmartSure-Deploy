using System.Net.Http.Json;
using AdminService.DTOs;
using AdminService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdminService.Controllers;

/// <summary>
/// Unified Admin Controller — handles reports/dashboard AND proxies
/// claim, policy-type, and user management to owning microservices.
/// All endpoints require Admin role.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _service;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;

    public AdminController(IAdminService service, IHttpClientFactory httpFactory, IConfiguration config)
    {
        _service = service;
        _httpFactory = httpFactory;
        _config = config;
    }

    // ─── Dashboard & Reports ──────────────────────────────────────────────────

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() =>
        Ok(await _service.GetDashboardStatsAsync());

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports() =>
        Ok(await _service.GetReportsAsync());

    [HttpPost("reports")]
    public async Task<IActionResult> GenerateReport([FromBody] CreateReportDto dto) =>
        Ok(await _service.GenerateReportAsync(dto));

    // ─── Claims (proxied to ClaimsService) ───────────────────────────────────

    [HttpGet("claims")]
    public async Task<IActionResult> GetAllClaims()
    {
        var client = CreateForwardingClient();
        var response = await client.GetAsync($"{ClaimsUrl}/api/claims");
        return await ForwardResponse(response);
    }

    [HttpPatch("claims/{id}/status")]
    public async Task<IActionResult> UpdateClaimStatus(int id, [FromBody] UpdateClaimStatusRequest dto)
    {
        var client = CreateForwardingClient();
        var response = await client.PatchAsJsonAsync($"{ClaimsUrl}/api/claims/{id}/status", dto);
        return await ForwardResponse(response);
    }

    [HttpGet("claims/{id}/documents")]
    public async Task<IActionResult> GetClaimDocuments(int id)
    {
        var client = CreateForwardingClient();
        var response = await client.GetAsync($"{ClaimsUrl}/api/claims/{id}/documents");
        return await ForwardResponse(response);
    }

    // ─── Policy Types (proxied to PolicyService) ──────────────────────────────

    [HttpGet("policy-types")]
    public async Task<IActionResult> GetPolicyTypes()
    {
        var client = CreateForwardingClient();
        var response = await client.GetAsync($"{PolicyUrl}/api/policy-types");
        return await ForwardResponse(response);
    }

    [HttpPost("policy-types")]
    public async Task<IActionResult> CreatePolicyType([FromBody] object dto)
    {
        var client = CreateForwardingClient();
        var response = await client.PostAsJsonAsync($"{PolicyUrl}/api/policy-types", dto);
        return await ForwardResponse(response);
    }

    [HttpDelete("policy-types/{id}")]
    public async Task<IActionResult> DeletePolicyType(int id)
    {
        var client = CreateForwardingClient();
        var response = await client.DeleteAsync($"{PolicyUrl}/api/policy-types/{id}");
        return await ForwardResponse(response);
    }

    // ─── Users (proxied to IdentityService) ──────────────────────────────────

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var client = CreateForwardingClient();
        var response = await client.GetAsync($"{IdentityUrl}/api/auth/users");
        return await ForwardResponse(response);
    }

    [HttpPatch("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] bool isActive)
    {
        var client = CreateForwardingClient();
        var response = await client.PatchAsJsonAsync($"{IdentityUrl}/api/auth/users/{id}/status", isActive);
        return await ForwardResponse(response);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private string IdentityUrl => _config["ServiceUrls:IdentityService"]!;
    private string PolicyUrl => _config["ServiceUrls:PolicyService"]!;
    private string ClaimsUrl => _config["ServiceUrls:ClaimsService"]!;

    private HttpClient CreateForwardingClient()
    {
        var client = _httpFactory.CreateClient("InternalClient");
        if (Request.Headers.TryGetValue("Authorization", out var auth))
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", auth.ToString());
        return client;
    }

    /// <summary>
    /// Forwards the downstream response back to the caller with correct JSON content type.
    /// FIX 2: Returns ContentResult with ContentType="application/json" so Angular
    /// HttpClient deserializes the body correctly instead of receiving a raw string.
    /// </summary>
    private async Task<IActionResult> ForwardResponse(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return new ContentResult
        {
            StatusCode = (int)response.StatusCode,
            Content = content,
            ContentType = "application/json"
        };
    }
}
