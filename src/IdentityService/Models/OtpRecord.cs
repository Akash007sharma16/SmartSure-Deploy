namespace IdentityService.Models;

public class OtpRecord
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;

    /// <summary>SHA-256 hash of the 6-digit OTP — never stored in plain text.</summary>
    public string OtpHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;

    /// <summary>Tracks failed verification attempts for brute-force protection.</summary>
    public int FailedAttempts { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
