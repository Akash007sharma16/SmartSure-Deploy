using MassTransit;
using PolicyService.Services;
using SmartSure.Contracts;

namespace PolicyService.Consumers;

/// <summary>
/// Listens for PolicyPurchaseCompleted events from the saga
/// and sends a confirmation email to the customer.
/// </summary>
public class PolicyPurchaseCompletedConsumer : IConsumer<PolicyPurchaseCompleted>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<PolicyPurchaseCompletedConsumer> _logger;

    public PolicyPurchaseCompletedConsumer(IEmailService emailService, ILogger<PolicyPurchaseCompletedConsumer> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PolicyPurchaseCompleted> context)
    {
        var msg = context.Message;

        if (string.IsNullOrWhiteSpace(msg.CustomerEmail))
        {
            _logger.LogWarning("PolicyPurchaseCompleted received without CustomerEmail for PolicyId {PolicyId}", msg.PolicyId);
            return;
        }

        _logger.LogInformation("Sending purchase confirmation email for PolicyId {PolicyId} to {Email}",
            msg.PolicyId, msg.CustomerEmail);

        await _emailService.SendPolicyPurchaseConfirmationAsync(
            msg.CustomerEmail,
            msg.CustomerName,
            msg.PolicyTypeName,
            msg.PolicyId,
            msg.CoverageAmount,
            msg.PremiumAmount,
            msg.StartDate,
            msg.EndDate);
    }
}
