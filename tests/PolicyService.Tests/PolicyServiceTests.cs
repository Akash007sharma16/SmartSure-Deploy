using Moq;
using NUnit.Framework;
using PolicyService.DTOs;
using PolicyService.Models;
using PolicyService.Repositories;

namespace PolicyService.Tests;

[TestFixture]
public class PolicyServiceTests
{
    private Mock<IPolicyRepository> _policyRepoMock = null!;
    private Mock<IPolicyTypeRepository> _typeRepoMock = null!;
    private Mock<IPremiumRepository> _premiumRepoMock = null!;
    private Mock<IPaymentRepository> _paymentRepoMock = null!;
    private PolicyService.Services.PolicyService _service = null!;

    [SetUp]
    public void Setup()
    {
        _policyRepoMock = new Mock<IPolicyRepository>();
        _typeRepoMock = new Mock<IPolicyTypeRepository>();
        _premiumRepoMock = new Mock<IPremiumRepository>();
        _paymentRepoMock = new Mock<IPaymentRepository>();
        _paymentRepoMock.Setup(r => r.CreateAsync(It.IsAny<Payment>()))
            .ReturnsAsync((Payment p) => p);
        _service = new PolicyService.Services.PolicyService(
            _policyRepoMock.Object, _typeRepoMock.Object, _premiumRepoMock.Object, _paymentRepoMock.Object);
    }

    [Test]
    public async Task BuyPolicy_ValidData_ReturnsDraftPolicy()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        _typeRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policyType);
        _policyRepoMock.Setup(r => r.CreateAsync(It.IsAny<Policy>()))
            .ReturnsAsync((Policy p) => { p.Id = 1; p.PolicyType = policyType; return p; });
        _premiumRepoMock.Setup(r => r.CreateAsync(It.IsAny<Premium>()))
            .ReturnsAsync((Premium p) => p);

        var result = await _service.BuyPolicyAsync(new BuyPolicyDto(1, 1, 100000m, DateTime.Today, DateTime.Today.AddYears(1)));

        Assert.That(result.Status, Is.EqualTo("Draft"));
        Assert.That(result.PolicyType, Is.EqualTo("Health"));
    }

    [Test]
    public async Task ActivatePolicy_DraftPolicy_ReturnsActiveAndCreatesPayment()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var premium = new Premium { Id = 1, PolicyId = 1, Amount = 5000m };
        var policy = new Policy
        {
            Id = 1, CustomerId = 1, Status = PolicyStatus.Draft,
            PolicyType = policyType,
            Premiums = new List<Premium> { premium }
        };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);
        _policyRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Policy>())).ReturnsAsync((Policy p) => p);

        var result = await _service.ActivatePolicyAsync(1, 1);

        Assert.That(result.Status, Is.EqualTo("Active"));
        // Verify payment was created
        _paymentRepoMock.Verify(r => r.CreateAsync(It.Is<Payment>(p =>
            p.PolicyId == 1 && p.Amount == 5000m && p.Status == PaymentStatus.Completed)), Times.Once);
    }

    [Test]
    public void ActivatePolicy_WrongCustomer_ThrowsUnauthorized()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var policy = new Policy { Id = 1, CustomerId = 1, Status = PolicyStatus.Draft, PolicyType = policyType };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.ActivatePolicyAsync(1, 99)); // wrong customer
    }

    [Test]
    public void ActivatePolicy_AlreadyActive_ThrowsInvalidOperation()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var policy = new Policy { Id = 1, CustomerId = 1, Status = PolicyStatus.Active, PolicyType = policyType };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);

        Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.ActivatePolicyAsync(1, 1));
    }

    [Test]
    public void BuyPolicy_InvalidPolicyType_ThrowsKeyNotFound()
    {
        _typeRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((PolicyType?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.BuyPolicyAsync(new BuyPolicyDto(1, 99, 50000m, DateTime.Today, DateTime.Today.AddYears(1))));
    }

    [Test]
    public async Task CalculatePremium_ReturnsCorrectAmount()
    {
        _typeRepoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new PolicyType { Id = 1, Name = "Auto", BaseRate = 10m });

        var result = await _service.CalculatePremiumAsync(new PremiumCalculationDto(1, 50000m));

        Assert.That(result.Amount, Is.EqualTo(5000m));
    }

    [Test]
    public void CalculatePremium_InvalidType_ThrowsKeyNotFound()
    {
        _typeRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((PolicyType?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.CalculatePremiumAsync(new PremiumCalculationDto(99, 50000m)));
    }

    [Test]
    public async Task GetPolicyTypes_ReturnsAll()
    {
        _typeRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<PolicyType>
        {
            new() { Id = 1, Name = "Health", BaseRate = 5m },
            new() { Id = 2, Name = "Auto", BaseRate = 8m }
        });

        var result = (await _service.GetPolicyTypesAsync()).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task CreatePolicyType_ReturnsNewType()
    {
        _typeRepoMock.Setup(r => r.CreateAsync(It.IsAny<PolicyType>()))
            .ReturnsAsync((PolicyType pt) => { pt.Id = 3; return pt; });

        var result = await _service.CreatePolicyTypeAsync(new CreatePolicyTypeDto("Life", "Life insurance", 3m));

        Assert.That(result.Name, Is.EqualTo("Life"));
        Assert.That(result.BaseRate, Is.EqualTo(3m));
    }

    [Test]
    public async Task GetCustomerPolicies_ReturnsPolicies()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        _policyRepoMock.Setup(r => r.GetByCustomerIdAsync(1)).ReturnsAsync(new List<Policy>
        {
            new() { Id = 1, CustomerId = 1, PolicyType = policyType, Status = PolicyStatus.Active, PolicyNumber = "POL-001" }
        });

        var result = (await _service.GetCustomerPoliciesAsync(1)).ToList();

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result[0].PolicyType, Is.EqualTo("Health"));
    }

    [Test]
    public async Task GetPolicyById_NotFound_ReturnsNull()
    {
        _policyRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Policy?)null);

        var result = await _service.GetPolicyByIdAsync(99);

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task UpdatePolicyStatus_ValidStatus_UpdatesPolicy()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var policy = new Policy { Id = 1, CustomerId = 1, Status = PolicyStatus.Active, PolicyType = policyType };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);
        _policyRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Policy>())).ReturnsAsync((Policy p) => p);

        var result = await _service.UpdatePolicyStatusAsync(1, "Cancelled");

        Assert.That(result.Status, Is.EqualTo("Cancelled"));
    }

    [Test]
    public void UpdatePolicyStatus_InvalidStatus_ThrowsArgumentException()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var policy = new Policy { Id = 1, CustomerId = 1, Status = PolicyStatus.Active, PolicyType = policyType };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);

        Assert.ThrowsAsync<ArgumentException>(() =>
            _service.UpdatePolicyStatusAsync(1, "InvalidStatus"));
    }

    [Test]
    public void UpdatePolicyStatus_NotFound_ThrowsKeyNotFound()
    {
        _policyRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Policy?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdatePolicyStatusAsync(99, "Cancelled"));
    }

    [Test]
    public async Task GetAllPolicies_ReturnsAll()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        _policyRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Policy>
        {
            new() { Id = 1, CustomerId = 1, PolicyType = policyType, Status = PolicyStatus.Active, EndDate = DateTime.UtcNow.AddYears(1) },
            new() { Id = 2, CustomerId = 2, PolicyType = policyType, Status = PolicyStatus.Cancelled, EndDate = DateTime.UtcNow.AddYears(1) }
        });

        var result = (await _service.GetAllPoliciesAsync()).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task GetAllPolicies_AutoExpiresOldPolicies()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        _policyRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Policy>
        {
            new() { Id = 1, CustomerId = 1, PolicyType = policyType, Status = PolicyStatus.Active, EndDate = DateTime.UtcNow.AddDays(-5) }
        });
        _policyRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Policy>())).ReturnsAsync((Policy p) => p);

        var result = (await _service.GetAllPoliciesAsync()).ToList();

        Assert.That(result[0].Status, Is.EqualTo("Expired"));
    }

    [Test]
    public async Task GetPolicyById_ExpiredPolicy_SetsExpiredStatus()
    {
        var policyType = new PolicyType { Id = 1, Name = "Health", BaseRate = 5m };
        var policy = new Policy
        {
            Id = 1, CustomerId = 1, Status = PolicyStatus.Active,
            PolicyType = policyType, EndDate = DateTime.UtcNow.AddDays(-1)
        };
        _policyRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(policy);
        _policyRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Policy>())).ReturnsAsync((Policy p) => p);

        var result = await _service.GetPolicyByIdAsync(1);

        Assert.That(result!.Status, Is.EqualTo("Expired"));
    }
}
