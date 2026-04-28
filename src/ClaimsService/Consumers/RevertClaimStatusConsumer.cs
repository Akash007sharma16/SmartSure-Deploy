using ClaimsService.Models;
using ClaimsService.Repositories;
using MassTransit;
using SmartSure.Contracts;

namespace ClaimsService.Consumers;

/// <summary>
/// Handles the RevertClaimStatus compensation command sent by the ClaimApprovalSaga
/// when the approval flow fails and the claim status needs to be rolled back.
/// </summary>
public class RevertClaimStatusConsumer : IConsumer<RevertClaimStatus>
{
    private readonly IClaimRepository _repo;
    private readonly ILogger<RevertClaimStatusConsumer> _logger;

    public RevertClaimStatusConsumer(IClaimRepository repo, ILogger<RevertClaimStatusConsumer> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<RevertClaimStatus> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Reverting claim {ClaimId} to status {Status}", msg.ClaimId, msg.RevertToStatus);

        var claim = await _repo.GetByIdAsync(msg.ClaimId);
        if (claim == null)
        {
            _logger.LogWarning("RevertClaimStatus: claim {ClaimId} not found.", msg.ClaimId);
            return;
        }

        if (Enum.TryParse<ClaimStatus>(msg.RevertToStatus, true, out var status))
        {
            claim.Status = status;
            claim.UpdatedAt = DateTime.UtcNow;
            await _repo.UpdateAsync(claim);
            _logger.LogInformation("Claim {ClaimId} reverted to {Status}.", msg.ClaimId, status);
        }
    }
}
