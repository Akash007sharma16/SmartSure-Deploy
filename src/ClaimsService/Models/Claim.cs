namespace ClaimsService.Models;

public enum ClaimStatus { Draft, Submitted, UnderReview, Approved, Rejected, Closed }

public class Claim
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int PolicyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal ClaimAmount { get; set; }
    public ClaimStatus Status { get; set; } = ClaimStatus.Draft;
    public string? AdminRemarks { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<ClaimDocument> Documents { get; set; } = new List<ClaimDocument>();
}
