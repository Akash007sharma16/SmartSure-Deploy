using System.ComponentModel.DataAnnotations;

namespace IdentityService.DTOs;

public record RegisterDto(
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Full name must be between 3 and 50 characters.")]
    [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Full name can only contain letters and spaces.")]
    string FullName,

    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$",
        ErrorMessage = "Password must include uppercase, lowercase, number, and special character with no spaces.")]
    string Password
    // Role is intentionally removed — all public registrations are hardcoded to "Customer"
);

public record LoginDto(
    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    string Password
);

public record AuthResponseDto(string Token, string Role, string FullName, int UserId);
public record UserDto(int Id, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt);

// ── Forgot Password DTOs ──────────────────────────────────────────────────────
public record ForgotPasswordDto(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    string Email
);

public record VerifyOtpDto(
    [Required] string Email,
    [Required] string Otp
);

public record ResetPasswordDto(
    [Required] string Email,
    [Required] string Otp,
    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$",
        ErrorMessage = "Password must include uppercase, lowercase, number, and special character.")]
    string NewPassword
);
