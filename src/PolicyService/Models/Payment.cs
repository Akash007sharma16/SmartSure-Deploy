namespace PolicyService.Models;

public enum PaymentStatus { Pending, Completed, Failed }

public class Payment
{
    public int Id { get; set; }
    public int PolicyId { get; set; }
    public Policy Policy { get; set; } = null!;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
}
