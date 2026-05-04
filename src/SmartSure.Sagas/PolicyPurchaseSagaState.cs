using MassTransit;

namespace SmartSure.Sagas;

/// <summary>Persisted state for the PolicyPurchase saga.</summary>
public class PolicyPurchaseSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = null!;

    public int PolicyId { get; set; }
    public int CustomerId { get; set; }
    public decimal CoverageAmount { get; set; }
    public DateTime? PolicyCreatedAt { get; set; }
    public DateTime? PolicyActivatedAt { get; set; }
    public DateTime? PaymentRecordedAt { get; set; }
    public string? FailureReason { get; set; }

    // Customer/policy details for email notifications
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string PolicyTypeName { get; set; } = string.Empty;
    public decimal PremiumAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
