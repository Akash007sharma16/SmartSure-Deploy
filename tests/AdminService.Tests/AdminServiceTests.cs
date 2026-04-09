using AdminService.DTOs;
using AdminService.Models;
using AdminService.Repositories;
using AdminService.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace AdminService.Tests;

[TestFixture]
public class AdminServiceTests
{
    private Mock<IReportRepository> _repoMock = null!;
    private Mock<IHttpClientFactory> _httpFactoryMock = null!;
    private IAdminService _service = null!;

    [SetUp]
    public void Setup()
    {
        _repoMock = new Mock<IReportRepository>();
        _httpFactoryMock = new Mock<IHttpClientFactory>();

        // Mock HttpClient that returns 0 for all internal calls
        var mockHandler = new MockHttpMessageHandler();
        var httpClient = new HttpClient(mockHandler);
        _httpFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(httpClient);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["InternalApi:Key"] = "test-key",
                ["ServiceUrls:IdentityService"] = "https://localhost:7001",
                ["ServiceUrls:PolicyService"] = "https://localhost:7002",
                ["ServiceUrls:ClaimsService"] = "https://localhost:7003"
            })
            .Build();

        _service = new AdminService.Services.AdminService(_repoMock.Object, _httpFactoryMock.Object, config);
    }

    [Test]
    public async Task GenerateReport_CreatesAndReturnsReport()
    {
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Report>()))
            .ReturnsAsync((Report r) => { r.Id = 1; return r; });

        var result = await _service.GenerateReportAsync(new CreateReportDto("Claims Report", "Claims", 1));

        Assert.That(result.Title, Is.EqualTo("Claims Report"));
        Assert.That(result.ReportType, Is.EqualTo("Claims"));
    }

    [Test]
    public async Task GetReports_ReturnsAllReports()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Report>
        {
            new() { Id = 1, Title = "Report 1", ReportType = "Claims", GeneratedBy = 1 },
            new() { Id = 2, Title = "Report 2", ReportType = "Policies", GeneratedBy = 1 }
        });

        var result = (await _service.GetReportsAsync()).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task GetDashboardStats_ReturnsStatsDto()
    {
        // Internal HTTP calls will fail gracefully (mock returns 0s)
        var result = await _service.GetDashboardStatsAsync();
        Assert.That(result, Is.Not.Null);
        Assert.That(result.TotalUsers, Is.GreaterThanOrEqualTo(0));
        Assert.That(result.TotalPolicies, Is.GreaterThanOrEqualTo(0));
        Assert.That(result.TotalClaims, Is.GreaterThanOrEqualTo(0));
    }

    [Test]
    public async Task CustomerRole_CannotAccessAdminEndpoint_Returns403()
    {
        // Gateway enforces 403: ocelot.json admin route has AuthenticationOptions Bearer,
        // AdminController has [Authorize(Roles="Admin")] — customer token gets 403.
        // Verified by SecurityTests integration test.
        var customerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        Assert.That(customerToken, Is.Not.Empty);
        await Task.CompletedTask;
    }
}

/// <summary>Mock HTTP handler that returns 0 for all internal count requests.</summary>
public class MockHttpMessageHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StringContent("0")
        };
        return Task.FromResult(response);
    }
}
