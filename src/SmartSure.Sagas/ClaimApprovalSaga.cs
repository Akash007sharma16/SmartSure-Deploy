using MassTransit;
using SmartSure.Contracts;

namespace SmartSure.Sagas;

/// <summary>
/// Orchestrates the Claim Approval flow:
/// ClaimSubmitted → ClaimUnderReview → ClaimApproved/ClaimRejected → ClaimClosed
/// On failure: publishes ClaimApprovalFailed (compensation via RevertClaimStatus command).
/// </summary>
public class ClaimApprovalSaga : MassTransitStateMachine<ClaimApprovalSagaState>
{
    public State SubmittedState { get; private set; } = null!;
    public State UnderReviewState { get; private set; } = null!;
    public State ApprovedState { get; private set; } = null!;
    public State RejectedState { get; private set; } = null!;
    public State ClosedState { get; private set; } = null!;
    public State FailedState { get; private set; } = null!;

    public Event<ClaimSubmitted> ClaimSubmittedEvent { get; private set; } = null!;
    public Event<ClaimUnderReview> ClaimUnderReviewEvent { get; private set; } = null!;
    public Event<ClaimApproved> ClaimApprovedEvent { get; private set; } = null!;
    public Event<ClaimRejected> ClaimRejectedEvent { get; private set; } = null!;
    public Event<ClaimClosed> ClaimClosedEvent { get; private set; } = null!;
    public Event<ClaimApprovalFailed> ClaimApprovalFailedEvent { get; private set; } = null!;

    public ClaimApprovalSaga()
    {
        InstanceState(x => x.CurrentState);

        Event(() => ClaimSubmittedEvent,    x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => ClaimUnderReviewEvent,  x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => ClaimApprovedEvent,     x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => ClaimRejectedEvent,     x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => ClaimClosedEvent,       x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => ClaimApprovalFailedEvent, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));

        Initially(
            When(ClaimSubmittedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.ClaimId = ctx.Message.ClaimId;
                    ctx.Saga.CustomerId = ctx.Message.CustomerId;
                    ctx.Saga.PolicyId = ctx.Message.PolicyId;
                    ctx.Saga.ClaimAmount = ctx.Message.ClaimAmount;
                    ctx.Saga.SubmittedAt = ctx.Message.SubmittedAt;
                })
                .TransitionTo(SubmittedState));

        During(SubmittedState,
            When(ClaimUnderReviewEvent)
                .Then(ctx => ctx.Saga.ReviewStartedAt = ctx.Message.ReviewStartedAt)
                .TransitionTo(UnderReviewState),
            When(ClaimApprovalFailedEvent)
                .Then(ctx => ctx.Saga.FailureReason = ctx.Message.Reason)
                .Publish(ctx => new RevertClaimStatus(ctx.Saga.CorrelationId, ctx.Saga.ClaimId, "Draft"))
                .TransitionTo(FailedState));

        During(UnderReviewState,
            When(ClaimApprovedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.AdminRemarks = ctx.Message.AdminRemarks;
                    ctx.Saga.ResolvedAt = ctx.Message.ApprovedAt;
                })
                .TransitionTo(ApprovedState),
            When(ClaimRejectedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.AdminRemarks = ctx.Message.Reason;
                    ctx.Saga.ResolvedAt = ctx.Message.RejectedAt;
                })
                .TransitionTo(RejectedState),
            When(ClaimApprovalFailedEvent)
                .Then(ctx => ctx.Saga.FailureReason = ctx.Message.Reason)
                .Publish(ctx => new RevertClaimStatus(ctx.Saga.CorrelationId, ctx.Saga.ClaimId, "Submitted"))
                .TransitionTo(FailedState));

        During(ApprovedState,
            When(ClaimClosedEvent)
                .Then(ctx => ctx.Saga.ResolvedAt = ctx.Message.ClosedAt)
                .TransitionTo(ClosedState));

        During(RejectedState,
            When(ClaimClosedEvent)
                .Then(ctx => ctx.Saga.ResolvedAt = ctx.Message.ClosedAt)
                .TransitionTo(ClosedState));

        SetCompletedWhenFinalized();
    }
}
