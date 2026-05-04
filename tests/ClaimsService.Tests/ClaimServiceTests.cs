using ClaimsService.DTOs;
using ClaimsService.Models;
using ClaimsService.Repositories;
using ClaimsService.Services;
using MassTransit;
using Microsoft.AspNetCore.Hosting;
using Moq;
using NUnit.Framework;

namespace ClaimsService.Tests;

[TestFixture]
public class ClaimServiceTests
{
    private Mock<IClaimRepository> _repoMock = null!;
    private Mock<IWebHostEnvironment> _envMock = null!;
    private Mock<IPublishEndpoint> _publishMock = null!;
    private IClaimService _service = null!;

    [SetUp]
    public void Setup()
    {
        _repoMock = new Mock<IClaimRepository>();
        _envMock = new Mock<IWebHostEnvironment>();
        _publishMock = new Mock<IPublishEndpoint>();
        _envMock.Setup(e => e.ContentRootPath).Returns(Path.GetTempPath());
        _service = new ClaimService(_repoMock.Object, _envMock.Object, _publishMock.Object);
    }

    [Test]
    public async Task InitiateClaim_ReturnsDraftClaim()
    {
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<Claim>()))
            .ReturnsAsync((Claim c) => { c.Id = 1; return c; });

        var result = await _service.InitiateClaimAsync(new InitiateClaimDto(1, 1, "Accident", 5000m));

        Assert.That(result.Status, Is.EqualTo("Draft"));
        Assert.That(result.ClaimAmount, Is.EqualTo(5000m));
        Assert.That(result.Id, Is.EqualTo(1));
    }

    [Test]
    public async Task SubmitClaim_DraftClaim_ChangesStatusToSubmitted()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.Draft };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Claim>())).ReturnsAsync((Claim c) => c);

        var result = await _service.SubmitClaimAsync(1);

        Assert.That(result.Status, Is.EqualTo("Submitted"));
    }

    [Test]
    public void SubmitClaim_AlreadySubmitted_ThrowsInvalidOperation()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.Submitted };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);

        Assert.ThrowsAsync<InvalidOperationException>(() => _service.SubmitClaimAsync(1));
    }

    [Test]
    public void SubmitClaim_NotFound_ThrowsKeyNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Claim?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() => _service.SubmitClaimAsync(99));
    }

    [Test]
    public async Task UpdateClaimStatus_AdminApproves_ChangesStatus()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.UnderReview };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Claim>())).ReturnsAsync((Claim c) => c);

        var result = await _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("Approved", "Verified"));

        Assert.That(result.Status, Is.EqualTo("Approved"));
        Assert.That(result.AdminRemarks, Is.EqualTo("Verified"));
    }

    [Test]
    public void UpdateClaimStatus_InvalidStatus_ThrowsArgumentException()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.UnderReview };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);

        Assert.ThrowsAsync<ArgumentException>(() =>
            _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("InvalidStatus", null)));
    }

    [Test]
    public void UpdateClaimStatus_NotFound_ThrowsKeyNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Claim?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateClaimStatusAsync(99, new UpdateClaimStatusDto("Approved", null)));
    }

    [Test]
    public async Task GetCustomerClaims_ReturnsClaims()
    {
        _repoMock.Setup(r => r.GetByCustomerIdAsync(1)).ReturnsAsync(new List<Claim>
        {
            new() { Id = 1, CustomerId = 1, PolicyId = 1, Status = ClaimStatus.Draft, ClaimAmount = 1000m },
            new() { Id = 2, CustomerId = 1, PolicyId = 2, Status = ClaimStatus.Submitted, ClaimAmount = 2000m }
        });

        var result = (await _service.GetCustomerClaimsAsync(1)).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task GetClaimById_ExistingClaim_ReturnsClaim()
    {
        _repoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new Claim { Id = 1, CustomerId = 1, Status = ClaimStatus.Draft });

        var result = await _service.GetClaimByIdAsync(1);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Id, Is.EqualTo(1));
    }

    [Test]
    public async Task GetClaimById_NotFound_ReturnsNull()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Claim?)null);

        var result = await _service.GetClaimByIdAsync(99);

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetAllClaims_ReturnsAll()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Claim>
        {
            new() { Id = 1, CustomerId = 1, Status = ClaimStatus.Submitted },
            new() { Id = 2, CustomerId = 2, Status = ClaimStatus.Approved }
        });

        var result = (await _service.GetAllClaimsAsync()).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task GetDocuments_ReturnsDocuments()
    {
        _repoMock.Setup(r => r.GetDocumentsByClaimIdAsync(1)).ReturnsAsync(new List<ClaimDocument>
        {
            new() { Id = 1, ClaimId = 1, FileName = "doc.pdf", FileType = "application/pdf" }
        });

        var result = (await _service.GetDocumentsAsync(1)).ToList();

        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result[0].FileName, Is.EqualTo("doc.pdf"));
    }

    // ── Lifecycle Transition Guard Tests ──────────────────────────────────────

    [Test]
    public async Task UpdateClaimStatus_ValidTransition_Submitted_To_UnderReview_Succeeds()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.Submitted };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Claim>())).ReturnsAsync((Claim c) => c);

        var result = await _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("UnderReview", null));

        Assert.That(result.Status, Is.EqualTo("UnderReview"));
    }

    [Test]
    public async Task UpdateClaimStatus_ValidTransition_UnderReview_To_Approved_Succeeds()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.UnderReview };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Claim>())).ReturnsAsync((Claim c) => c);

        var result = await _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("Approved", "Verified"));

        Assert.That(result.Status, Is.EqualTo("Approved"));
    }

    [Test]
    public void UpdateClaimStatus_InvalidTransition_Draft_To_Approved_ThrowsInvalidOperation()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.Draft };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("Approved", null)));

        Assert.That(ex!.Message, Does.Contain("Cannot transition from Draft to Approved"));
    }

    [Test]
    public void UpdateClaimStatus_InvalidTransition_Closed_To_Submitted_ThrowsInvalidOperation()
    {
        var claim = new Claim { Id = 1, Status = ClaimStatus.Closed };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(claim);

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.UpdateClaimStatusAsync(1, new UpdateClaimStatusDto("Submitted", null)));

        Assert.That(ex!.Message, Does.Contain("Cannot transition from Closed to Submitted"));
    }
}
