namespace IdentityService.DTOs;

public record RegisterDto(string FullName, string Email, string Password, string Role = "Customer");
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Role, string FullName, int UserId);
public record UserDto(int Id, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt);
