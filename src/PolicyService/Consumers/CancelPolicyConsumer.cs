using MassTransit;
using PolicyService.Repositories;
using PolicyService.Models;
using SmartSure.Contracts;

namespace PolicyService.Consumers;

/// <summary>
/// Handles the CancelPolicy compensation command sent by the PolicyPurchaseSaga
/// when the purchase flow fails after a policy has been created.
/// </summary>
public class CancelPolicyConsumer : IConsumer<CancelPolicy>
{
    private readonly IPolicyRepository _repo;
    private readonly ILogger<CancelPolicyConsumer> _logger;

    public CancelPolicyConsumer(IPolicyRepository repo, ILogger<CancelPolicyConsumer> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CancelPolicy> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Cancelling policy {PolicyId}. Reason: {Reason}", msg.PolicyId, msg.Reason);

        var policy = await _repo.GetByIdAsync(msg.PolicyId);
        if (policy == null)
        {
            _logger.LogWarning("CancelPolicy: policy {PolicyId} not found.", msg.PolicyId);
            return;
        }

        policy.Status = PolicyStatus.Cancelled;
        await _repo.UpdateAsync(policy);

        _logger.LogInformation("Policy {PolicyId} cancelled successfully.", msg.PolicyId);
    }
}
