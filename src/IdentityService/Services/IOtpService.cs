namespace IdentityService.Services;

public interface IOtpService
{
    /// <summary>Generates a 6-digit OTP, stores its SHA-256 hash, and returns the plain OTP for emailing.</summary>
    Task<string> GenerateAndStoreOtpAsync(string email);

    /// <summary>
    /// Verifies the OTP. Returns true if valid.
    /// Increments failed attempts on mismatch; locks after 5 failures.
    /// </summary>
    Task<bool> VerifyOtpAsync(string email, string otp);

    /// <summary>Marks the OTP as used after a successful password reset.</summary>
    Task InvalidateOtpAsync(string email);
}
