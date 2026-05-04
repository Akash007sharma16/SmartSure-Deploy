using MassTransit;
using PolicyService.Services;
using SmartSure.Contracts;

namespace PolicyService.Consumers;

/// <summary>
/// Listens for PolicyPurchaseFailed events from the saga
/// and sends a failure notification email to the customer.
/// </summary>
public class PolicyPurchaseFailedConsumer : IConsumer<PolicyPurchaseFailed>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<PolicyPurchaseFailedConsumer> _logger;

    public PolicyPurchaseFailedConsumer(IEmailService emailService, ILogger<PolicyPurchaseFailedConsumer> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PolicyPurchaseFailed> context)
    {
        var msg = context.Message;

        if (string.IsNullOrWhiteSpace(msg.CustomerEmail))
        {
            _logger.LogWarning("PolicyPurchaseFailed received without CustomerEmail for PolicyId {PolicyId}", msg.PolicyId);
            return;
        }

        _logger.LogInformation("Sending purchase failure email for PolicyId {PolicyId} to {Email}",
            msg.PolicyId, msg.CustomerEmail);

        await _emailService.SendPolicyPurchaseFailureAsync(
            msg.CustomerEmail,
            msg.CustomerName,
            msg.Reason);
    }
}
