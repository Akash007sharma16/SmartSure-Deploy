using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace IdentityService.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string toEmail, string toName, string otp)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:SenderName"] ?? "SmartSure",
                _config["Email:SenderEmail"] ?? "noreply@smartsure.com"));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = "SmartSure — Your Password Reset OTP";

            message.Body = new TextPart("html")
            {
                Text = BuildOtpEmailHtml(toName, otp)
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Email:SmtpHost"] ?? "smtp.gmail.com",
                int.Parse(_config["Email:SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls);

            // Gmail app passwords may contain spaces — strip them
            var username = _config["Email:Username"] ?? "";
            var password = (_config["Email:Password"] ?? "").Replace(" ", "");

            await client.AuthenticateAsync(username, password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("OTP email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            // Non-blocking — log failure but never throw to caller
            _logger.LogError(ex, "Failed to send OTP email to {Email}. SMTP: {Host}:{Port}, User: {User}",
                toEmail,
                _config["Email:SmtpHost"],
                _config["Email:SmtpPort"],
                _config["Email:Username"]);
        }
    }

    private static string BuildOtpEmailHtml(string name, string otp) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px;
                      box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🛡️ SmartSure</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
                Insurance made simple &amp; smart
              </p>
            </div>
            <!-- Body -->
            <div style="padding: 36px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 12px;">Password Reset Request</h2>
              <p style="color: #555; line-height: 1.6;">Hi <strong>{name}</strong>,</p>
              <p style="color: #555; line-height: 1.6;">
                We received a request to reset your SmartSure account password.
                Use the OTP below to proceed. It is valid for <strong>10 minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background: #f0f4ff; border: 2px dashed #1a73e8; border-radius: 10px;
                          text-align: center; padding: 24px; margin: 28px 0;">
                <p style="margin: 0 0 6px; color: #888; font-size: 13px; text-transform: uppercase;
                           letter-spacing: 1px;">Your One-Time Password</p>
                <span style="font-size: 42px; font-weight: 700; letter-spacing: 10px; color: #1a73e8;">
                  {otp}
                </span>
              </div>
              <p style="color: #888; font-size: 13px; line-height: 1.6;">
                ⚠️ If you did not request a password reset, please ignore this email.
                Your account remains secure.
              </p>
            </div>
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px 40px; text-align: center;
                        border-top: 1px solid #e9ecef;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                © {DateTime.UtcNow.Year} SmartSure Insurance. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
        """;
}
