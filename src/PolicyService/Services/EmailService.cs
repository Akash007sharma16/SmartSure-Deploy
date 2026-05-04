using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace PolicyService.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendPolicyPurchaseConfirmationAsync(
        string toEmail, string toName, string policyTypeName,
        int policyId, decimal coverageAmount, decimal premiumAmount,
        DateTime startDate, DateTime endDate)
    {
        try
        {
            var message = BuildMessage(toEmail, toName, "🎉 Your SmartSure Policy is Active!",
                BuildConfirmationHtml(toName, policyTypeName, policyId, coverageAmount, premiumAmount, startDate, endDate));

            await SendAsync(message);
            _logger.LogInformation("Policy confirmation email sent to {Email} for PolicyId {PolicyId}", toEmail, policyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send policy confirmation email to {Email}", toEmail);
        }
    }

    public async Task SendPolicyPurchaseFailureAsync(string toEmail, string toName, string reason)
    {
        try
        {
            var message = BuildMessage(toEmail, toName, "SmartSure — Policy Purchase Update",
                BuildFailureHtml(toName, reason));

            await SendAsync(message);
            _logger.LogInformation("Policy failure email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send policy failure email to {Email}", toEmail);
        }
    }

    private MimeMessage BuildMessage(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _config["Email:SenderName"] ?? "SmartSure",
            _config["Email:SenderEmail"] ?? "noreply@smartsure.com"));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };
        return message;
    }

    private async Task SendAsync(MimeMessage message)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync(
            _config["Email:SmtpHost"] ?? "smtp.gmail.com",
            int.Parse(_config["Email:SmtpPort"] ?? "587"),
            SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(
            _config["Email:Username"] ?? "",
            _config["Email:Password"] ?? "");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string BuildConfirmationHtml(
        string name, string policyTypeName, int policyId,
        decimal coverageAmount, decimal premiumAmount,
        DateTime startDate, DateTime endDate) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px;
                      box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 32px 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 26px;">🛡️ SmartSure</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Policy Confirmation</p>
            </div>
            <div style="padding: 36px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 8px;">Congratulations, {name}! 🎉</h2>
              <p style="color: #555; line-height: 1.6;">
                Your <strong>{policyTypeName}</strong> policy has been successfully activated.
                Here are your policy details:
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f9fa;">
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Policy ID</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a1a2e;">#{policyId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Policy Type</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a1a2e;">{policyTypeName}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Coverage Amount</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a73e8;">₹{coverageAmount:N0}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Annual Premium</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a1a2e;">₹{premiumAmount:N2}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Valid From</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a1a2e;">{startDate:dd MMM yyyy}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #666; font-size: 14px;">Valid Until</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #1a1a2e;">{endDate:dd MMM yyyy}</td>
                </tr>
              </table>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                You can view and manage your policy anytime from your SmartSure dashboard.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                © {DateTime.UtcNow.Year} SmartSure Insurance. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
        """;

    private static string BuildFailureHtml(string name, string reason) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px;
                      box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #e53935, #b71c1c); padding: 32px 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 26px;">🛡️ SmartSure</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Policy Purchase Update</p>
            </div>
            <div style="padding: 36px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 12px;">Hi {name},</h2>
              <p style="color: #555; line-height: 1.6;">
                Unfortunately, we were unable to complete your policy purchase.
              </p>
              <div style="background: #fff3f3; border-left: 4px solid #e53935; padding: 16px 20px;
                          border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #c62828; font-size: 14px;">
                  <strong>Reason:</strong> {reason}
                </p>
              </div>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Please try again or contact our support team if the issue persists.
                No charges have been made to your account.
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                © {DateTime.UtcNow.Year} SmartSure Insurance. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
        """;
}
