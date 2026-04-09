using System.Diagnostics.CodeAnalysis;
using ClaimsService.DTOs;
using ClaimsService.Models;
using ClaimsService.Repositories;

namespace ClaimsService.Services;

public class ClaimService : IClaimService
{
    private readonly IClaimRepository _repo;
    private readonly IWebHostEnvironment _env;

    public ClaimService(IClaimRepository repo, IWebHostEnvironment env)
    {
        _repo = repo;
        _env = env;
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

        claim.Status = newStatus;
        claim.AdminRemarks = dto.AdminRemarks;
        claim.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(claim);
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

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var doc = new ClaimDocument
        {
            ClaimId = claimId,
            FileName = file.FileName,
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
