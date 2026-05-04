using System.Security.Cryptography;
using System.Text;
using IdentityService.Data;
using IdentityService.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Services;

public class OtpService : IOtpService
{
    private const int OtpExpiryMinutes = 10;
    private const int MaxFailedAttempts = 5;

    private readonly IdentityDbContext _db;
    private readonly ILogger<OtpService> _logger;

    public OtpService(IdentityDbContext db, ILogger<OtpService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<string> GenerateAndStoreOtpAsync(string email)
    {
        // Invalidate any existing OTPs for this email
        var existing = await _db.OtpRecords
            .Where(o => o.Email == email && !o.IsUsed)
            .ToListAsync();
        _db.OtpRecords.RemoveRange(existing);

        // Generate a cryptographically random 6-digit OTP
        var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        var record = new OtpRecord
        {
            Email = email,
            OtpHash = HashOtp(otp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
            IsUsed = false,
            FailedAttempts = 0,
            CreatedAt = DateTime.UtcNow
        };

        _db.OtpRecords.Add(record);
        await _db.SaveChangesAsync();

        _logger.LogInformation("OTP generated for {Email}", email);
        return otp; // Return plain OTP only for emailing — never persisted
    }

    public async Task<bool> VerifyOtpAsync(string email, string otp)
    {
        var record = await _db.OtpRecords
            .Where(o => o.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (record == null)
            throw new InvalidOperationException("No active OTP found. Please request a new one.");

        // Brute-force protection: lock after 5 failed attempts
        if (record.FailedAttempts >= MaxFailedAttempts)
            throw new InvalidOperationException("Too many failed attempts. Please request a new OTP.");

        if (record.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("OTP has expired. Please request a new one.");

        if (record.OtpHash != HashOtp(otp))
        {
            record.FailedAttempts++;
            await _db.SaveChangesAsync();
            _logger.LogWarning("Invalid OTP attempt for {Email} (attempt {Count})", email, record.FailedAttempts);
            return false;
        }

        // Valid — do NOT mark as used yet; that happens after password reset
        return true;
    }

    public async Task InvalidateOtpAsync(string email)
    {
        var records = await _db.OtpRecords
            .Where(o => o.Email == email && !o.IsUsed)
            .ToListAsync();

        foreach (var r in records)
            r.IsUsed = true;

        await _db.SaveChangesAsync();
    }

    private static string HashOtp(string otp)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(otp));
        return Convert.ToHexString(bytes);
    }
}
