namespace PolicyService.Models;

public class Premium
{
    public int Id { get; set; }
    public int PolicyId { get; set; }
    public Policy Policy { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}
