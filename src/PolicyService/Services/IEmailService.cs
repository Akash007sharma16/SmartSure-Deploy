namespace PolicyService.Services;

public interface IEmailService
{
    Task SendPolicyPurchaseConfirmationAsync(
        string toEmail, string toName, string policyTypeName,
        int policyId, decimal coverageAmount, decimal premiumAmount,
        DateTime startDate, DateTime endDate);

    Task SendPolicyPurchaseFailureAsync(
        string toEmail, string toName, string reason);
}
