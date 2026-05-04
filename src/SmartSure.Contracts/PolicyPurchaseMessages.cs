namespace SmartSure.Contracts;

// ── Policy Purchase Saga Messages ─────────────────────────────────────────────

/// <summary>Published by PolicyService when a new policy is created (Draft).</summary>
public record PolicyCreated(
    Guid CorrelationId,
    int PolicyId,
    int CustomerId,
    int PolicyTypeId,
    decimal CoverageAmount,
    DateTime StartDate,
    DateTime EndDate,
    // Customer details for email notifications
    string CustomerEmail = "",
    string CustomerName = "",
    string PolicyTypeName = "");

/// <summary>Published by PolicyService when a policy moves to Active.</summary>
public record PolicyActivated(
    Guid CorrelationId,
    int PolicyId,
    int CustomerId);

/// <summary>Published by PolicyService when premium payment is recorded.</summary>
public record PaymentRecorded(
    Guid CorrelationId,
    int PolicyId,
    decimal Amount,
    DateTime PaidAt);

/// <summary>Command sent to PolicyService to cancel a policy (compensation).</summary>
public record CancelPolicy(
    Guid CorrelationId,
    int PolicyId,
    string Reason);

/// <summary>Published by SagaHost when the full purchase flow completes successfully.</summary>
public record PolicyPurchaseCompleted(
    Guid CorrelationId,
    int PolicyId,
    int CustomerId,
    DateTime CompletedAt,
    // Customer/policy details forwarded from PolicyCreated for email
    string CustomerEmail = "",
    string CustomerName = "",
    string PolicyTypeName = "",
    decimal CoverageAmount = 0,
    decimal PremiumAmount = 0,
    DateTime StartDate = default,
    DateTime EndDate = default);

/// <summary>Published by SagaHost when the purchase flow fails.</summary>
public record PolicyPurchaseFailed(
    Guid CorrelationId,
    int PolicyId,
    string Reason,
    DateTime FailedAt,
    // Customer details for failure notification email
    string CustomerEmail = "",
    string CustomerName = "");
