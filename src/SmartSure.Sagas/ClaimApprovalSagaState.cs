using MassTransit;

namespace SmartSure.Sagas;

/// <summary>Persisted state for the ClaimApproval saga.</summary>
public class ClaimApprovalSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = null!;

    public int ClaimId { get; set; }
    public int CustomerId { get; set; }
    public int PolicyId { get; set; }
    public decimal ClaimAmount { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewStartedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? AdminRemarks { get; set; }
    public string? FailureReason { get; set; }
}
