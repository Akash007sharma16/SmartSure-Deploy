namespace IdentityService.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string toName, string otp);
}
