namespace ClaimsService.Models;

public class ClaimDocument
{
    public int Id { get; set; }
    public int ClaimId { get; set; }
    public Claim Claim { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
