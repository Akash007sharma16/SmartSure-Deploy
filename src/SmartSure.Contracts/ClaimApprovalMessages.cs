namespace SmartSure.Contracts;

// ── Claim Approval Saga Messages ──────────────────────────────────────────────

/// <summary>Published by ClaimsService when a claim is submitted.</summary>
public record ClaimSubmitted(
    Guid CorrelationId,
    int ClaimId,
    int CustomerId,
    int PolicyId,
    decimal ClaimAmount,
    DateTime SubmittedAt);

/// <summary>Published by ClaimsService when admin starts reviewing a claim.</summary>
public record ClaimUnderReview(
    Guid CorrelationId,
    int ClaimId,
    DateTime ReviewStartedAt);

/// <summary>Published by ClaimsService when admin approves a claim.</summary>
public record ClaimApproved(
    Guid CorrelationId,
    int ClaimId,
    int CustomerId,
    decimal ApprovedAmount,
    string? AdminRemarks,
    DateTime ApprovedAt);

/// <summary>Published by ClaimsService when admin rejects a claim.</summary>
public record ClaimRejected(
    Guid CorrelationId,
    int ClaimId,
    int CustomerId,
    string Reason,
    DateTime RejectedAt);

/// <summary>Published by ClaimsService when a claim is closed.</summary>
public record ClaimClosed(
    Guid CorrelationId,
    int ClaimId,
    DateTime ClosedAt);

/// <summary>Command sent to ClaimsService to revert claim status (compensation).</summary>
public record RevertClaimStatus(
    Guid CorrelationId,
    int ClaimId,
    string RevertToStatus);

/// <summary>Published by SagaHost when the claim approval flow fails.</summary>
public record ClaimApprovalFailed(
    Guid CorrelationId,
    int ClaimId,
    string Reason,
    DateTime FailedAt);
