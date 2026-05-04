using System.Diagnostics.CodeAnalysis;
using ClaimsService.DTOs;
using ClaimsService.Models;
using ClaimsService.Repositories;
using MassTransit;
using SmartSure.Contracts;

namespace ClaimsService.Services;

public class ClaimService : IClaimService
{
    private readonly IClaimRepository _repo;
    private readonly IWebHostEnvironment _env;
    private readonly IPublishEndpoint _publish;

    public ClaimService(IClaimRepository repo, IWebHostEnvironment env, IPublishEndpoint publish)
    {
        _repo = repo;
        _env = env;
        _publish = publish;
    }

    public async Task<ClaimDto> InitiateClaimAsync(InitiateClaimDto dto)
    {
        var claim = new Claim
        {
            CustomerId = dto.CustomerId,
            PolicyId = dto.PolicyId,
            Description = dto.Description,
            ClaimAmount = dto.ClaimAmount,
            Status = ClaimStatus.Draft
        };
        await _repo.CreateAsync(claim);
        return MapToDto(claim);
    }

    public async Task<ClaimDto> SubmitClaimAsync(int claimId)
    {
        var claim = await _repo.GetByIdAsync(claimId)
            ?? throw new KeyNotFoundException("Claim not found.");

        if (claim.Status != ClaimStatus.Draft)
            throw new InvalidOperationException("Only Draft claims can be submitted.");

        claim.Status = ClaimStatus.Submitted;
        claim.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(claim);

        // Publish event for saga (non-blocking — works even if RabbitMQ is down)
        try
        {
            await _publish.Publish(new ClaimSubmitted(
                Guid.NewGuid(), claim.Id, claim.CustomerId, claim.PolicyId,
                claim.ClaimAmount, DateTime.UtcNow));
        }
        catch { /* RabbitMQ unavailable — saga event skipped, core flow continues */ }

        return MapToDto(claim);
    }

    public async Task<IEnumerable<ClaimDto>> GetCustomerClaimsAsync(int customerId)
    {
        var claims = await _repo.GetByCustomerIdAsync(customerId);
        return claims.Select(MapToDto);
    }

    public async Task<ClaimDto?> GetClaimByIdAsync(int id)
    {
        var claim = await _repo.GetByIdAsync(id);
        return claim == null ? null : MapToDto(claim);
    }

    public async Task<IEnumerable<ClaimDto>> GetAllClaimsAsync()
    {
        var claims = await _repo.GetAllAsync();
        return claims.Select(MapToDto);
    }

    public async Task<ClaimDto> UpdateClaimStatusAsync(int id, UpdateClaimStatusDto dto)
    {
        var claim = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Claim not found.");

        if (!Enum.TryParse<ClaimStatus>(dto.Status, true, out var newStatus))
            throw new ArgumentException("Invalid status.");

        // ── Lifecycle transition guard ────────────────────────────────────────
        var validTransitions = new Dictionary<ClaimStatus, ClaimStatus[]>
        {
            [ClaimStatus.Draft]       = [ClaimStatus.Submitted],
            [ClaimStatus.Submitted]   = [ClaimStatus.UnderReview],
            [ClaimStatus.UnderReview] = [ClaimStatus.Approved, ClaimStatus.Rejected],
            [ClaimStatus.Approved]    = [ClaimStatus.Closed],
            [ClaimStatus.Rejected]    = [ClaimStatus.Closed],
            [ClaimStatus.Closed]      = []
        };

        if (!validTransitions.TryGetValue(claim.Status, out var allowed) || !allowed.Contains(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {claim.Status} to {newStatus}.");

        claim.Status = newStatus;
        claim.AdminRemarks = dto.AdminRemarks;
        claim.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(claim);

        // Publish events for saga based on new status (non-blocking)
        try
        {
            var correlationId = Guid.NewGuid();
            switch (newStatus)
            {
                case ClaimStatus.UnderReview:
                    await _publish.Publish(new ClaimUnderReview(correlationId, claim.Id, DateTime.UtcNow));
                    break;
                case ClaimStatus.Approved:
                    await _publish.Publish(new ClaimApproved(correlationId, claim.Id, claim.CustomerId,
                        claim.ClaimAmount, dto.AdminRemarks, DateTime.UtcNow));
                    break;
                case ClaimStatus.Rejected:
                    await _publish.Publish(new ClaimRejected(correlationId, claim.Id, claim.CustomerId,
                        dto.AdminRemarks ?? "Rejected by admin", DateTime.UtcNow));
                    break;
                case ClaimStatus.Closed:
                    await _publish.Publish(new ClaimClosed(correlationId, claim.Id, DateTime.UtcNow));
                    break;
            }
        }
        catch { /* RabbitMQ unavailable — saga event skipped, core flow continues */ }

        return MapToDto(claim);
    }

    [ExcludeFromCodeCoverage] // File I/O — tested via integration tests
    public async Task<ClaimDocumentDto> UploadDocumentAsync(int claimId, IFormFile file)
    {
        if (file.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File size exceeds 10MB limit.");

        var allowedTypes = new[]
        {
            "application/pdf", "image/jpeg", "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };
        if (!allowedTypes.Contains(file.ContentType))
            throw new ArgumentException("File type not allowed. Use PDF, JPG, PNG, or Word documents.");

        var claim = await _repo.GetByIdAsync(claimId)
            ?? throw new KeyNotFoundException("Claim not found.");

        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        // Sanitize filename to prevent path traversal attacks
        var safeFileName = Path.GetFileName(file.FileName);
        var fileName = $"{Guid.NewGuid()}_{safeFileName}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var doc = new ClaimDocument
        {
            ClaimId = claimId,
            FileName = safeFileName,
            FilePath = filePath,
            FileType = file.ContentType
        };

        await _repo.AddDocumentAsync(doc);
        return new ClaimDocumentDto(doc.Id, doc.ClaimId, doc.FileName, doc.FileType, doc.UploadedAt);
    }
    public async Task<IEnumerable<ClaimDocumentDto>> GetDocumentsAsync(int claimId)
    {
        var docs = await _repo.GetDocumentsByClaimIdAsync(claimId);
        return docs.Select(d => new ClaimDocumentDto(d.Id, d.ClaimId, d.FileName, d.FileType, d.UploadedAt));
    }

    private static ClaimDto MapToDto(Claim c) =>
        new(c.Id, c.CustomerId, c.PolicyId, c.Description,
            c.ClaimAmount, c.Status.ToString(), c.AdminRemarks, c.CreatedAt);
}
