using System.Net.Http.Json;
using NUnit.Framework;

namespace AdminService.Tests;

/// <summary>
/// Integration test — requires ALL 5 services running on their HTTPS ports.
///
/// HOW TO RUN (only when services are running):
///   dotnet test tests/AdminService.Tests/AdminService.Tests.csproj
///          --filter "FullyQualifiedName~SecurityTests" --no-build --settings tests.runsettings
///
/// This test is marked [Explicit] so it NEVER runs in the normal test suite.
/// It only runs when called by name explicitly.
/// </summary>
[TestFixture]
[Category("Integration")]
[Explicit("Requires all 5 services running on localhost. Run manually only.")]
public class SecurityTests
{
    private HttpClient _client = null!;

    [SetUp]
    public void Setup()
    {
        _client = new HttpClient(new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        })
        {
            BaseAddress = new Uri("https://localhost:7000"),
            Timeout = TimeSpan.FromSeconds(10)
        };
    }

    [Test]
    [Timeout(15000)]
    public async Task AdminEndpoint_WithCustomerJwt_Returns403()
    {
        // Step 1: Register a test customer (idempotent — ignore conflict)
        await _client.PostAsJsonAsync("/gateway/auth/register", new
        {
            FullName = "Test Customer",
            Email = "testcustomer@smartsure.com",
            Password = "Test@123",
            Role = "Customer"
        });

        // Step 2: Login as customer
        var loginRes = await _client.PostAsJsonAsync("/gateway/auth/login", new
        {
            Email = "testcustomer@smartsure.com",
            Password = "Test@123"
        });

        Assert.That(loginRes.IsSuccessStatusCode, Is.True,
            $"Customer login failed: {await loginRes.Content.ReadAsStringAsync()}");

        var body = await loginRes.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.Role, Is.EqualTo("Customer"));

        // Step 3: Call admin-only endpoint with customer token
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", body.Token);

        var response = await _client.GetAsync("/gateway/admin/reports");

        // Step 4: Assert 403 Forbidden
        Assert.That((int)response.StatusCode, Is.EqualTo(403),
            $"Expected 403 but got {(int)response.StatusCode}");
    }

    [TearDown]
    public void TearDown() => _client.Dispose();
}

public record LoginResponse(string Token, string Role, string FullName, int UserId);
