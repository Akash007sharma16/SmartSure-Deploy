using MassTransit;
using SmartSure.Contracts;

namespace SmartSure.Sagas;

/// <summary>
/// Orchestrates the Policy Purchase flow:
/// PolicyCreated → PolicyActivated → PaymentRecorded → Completed
/// On failure: publishes PolicyPurchaseFailed (compensation via CancelPolicy command).
/// </summary>
public class PolicyPurchaseSaga : MassTransitStateMachine<PolicyPurchaseSagaState>
{
    public State PolicyCreatedState { get; private set; } = null!;
    public State PolicyActivatedState { get; private set; } = null!;
    public State CompletedState { get; private set; } = null!;
    public State FailedState { get; private set; } = null!;

    public Event<PolicyCreated> PolicyCreatedEvent { get; private set; } = null!;
    public Event<PolicyActivated> PolicyActivatedEvent { get; private set; } = null!;
    public Event<PaymentRecorded> PaymentRecordedEvent { get; private set; } = null!;
    public Event<PolicyPurchaseFailed> PolicyPurchaseFailedEvent { get; private set; } = null!;

    public PolicyPurchaseSaga()
    {
        InstanceState(x => x.CurrentState);

        Event(() => PolicyCreatedEvent,       x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => PolicyActivatedEvent,     x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => PaymentRecordedEvent,     x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => PolicyPurchaseFailedEvent, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));

        Initially(
            When(PolicyCreatedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.PolicyId = ctx.Message.PolicyId;
                    ctx.Saga.CustomerId = ctx.Message.CustomerId;
                    ctx.Saga.CoverageAmount = ctx.Message.CoverageAmount;
                    ctx.Saga.PolicyCreatedAt = DateTime.UtcNow;
                    // Store customer/policy details for email notifications
                    ctx.Saga.CustomerEmail = ctx.Message.CustomerEmail;
                    ctx.Saga.CustomerName = ctx.Message.CustomerName;
                    ctx.Saga.PolicyTypeName = ctx.Message.PolicyTypeName;
                    ctx.Saga.StartDate = ctx.Message.StartDate;
                    ctx.Saga.EndDate = ctx.Message.EndDate;
                })
                .TransitionTo(PolicyCreatedState));

        During(PolicyCreatedState,
            When(PolicyActivatedEvent)
                .Then(ctx => ctx.Saga.PolicyActivatedAt = DateTime.UtcNow)
                .TransitionTo(PolicyActivatedState),
            When(PolicyPurchaseFailedEvent)
                .Then(ctx => ctx.Saga.FailureReason = ctx.Message.Reason)
                .Publish(ctx => new CancelPolicy(ctx.Saga.CorrelationId, ctx.Saga.PolicyId, ctx.Message.Reason))
                .TransitionTo(FailedState));

        During(PolicyActivatedState,
            When(PaymentRecordedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.PaymentRecordedAt = DateTime.UtcNow;
                    ctx.Saga.PremiumAmount = ctx.Message.Amount;
                })
                .Publish(ctx => new PolicyPurchaseCompleted(
                    ctx.Saga.CorrelationId,
                    ctx.Saga.PolicyId,
                    ctx.Saga.CustomerId,
                    DateTime.UtcNow,
                    ctx.Saga.CustomerEmail,
                    ctx.Saga.CustomerName,
                    ctx.Saga.PolicyTypeName,
                    ctx.Saga.CoverageAmount,
                    ctx.Saga.PremiumAmount,
                    ctx.Saga.StartDate,
                    ctx.Saga.EndDate))
                .TransitionTo(CompletedState),
            When(PolicyPurchaseFailedEvent)
                .Then(ctx => ctx.Saga.FailureReason = ctx.Message.Reason)
                .Publish(ctx => new CancelPolicy(ctx.Saga.CorrelationId, ctx.Saga.PolicyId, ctx.Message.Reason))
                .TransitionTo(FailedState));

        SetCompletedWhenFinalized();
    }
}
