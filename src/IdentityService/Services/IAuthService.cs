using IdentityService.DTOs;

namespace IdentityService.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> UpdateUserStatusAsync(int id, bool isActive);

    // Forgot Password flow
    Task ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<bool> VerifyOtpAsync(VerifyOtpDto dto);
    Task ResetPasswordAsync(ResetPasswordDto dto);
}
