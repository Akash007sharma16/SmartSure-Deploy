namespace PolicyService.Models;

public enum PolicyStatus { Draft, Active, Expired, Cancelled }

public class Policy
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int PolicyTypeId { get; set; }
    public PolicyType PolicyType { get; set; } = null!;
    public string PolicyNumber { get; set; } = string.Empty;
    public decimal CoverageAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public PolicyStatus Status { get; set; } = PolicyStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Premium> Premiums { get; set; } = new List<Premium>();
}
