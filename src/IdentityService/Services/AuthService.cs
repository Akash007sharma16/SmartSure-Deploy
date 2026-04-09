using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityService.DTOs;
using IdentityService.Models;
using IdentityService.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace IdentityService.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _repo;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await _repo.GetByEmailAsync(dto.Email);
        if (existing != null) throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        await _repo.CreateAsync(user);
        return new AuthResponseDto(GenerateToken(user), user.Role, user.FullName, user.Id);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _repo.GetByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive) throw new UnauthorizedAccessException("Account is disabled.");

        return new AuthResponseDto(GenerateToken(user), user.Role, user.FullName, user.Id);
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _repo.GetAllAsync();
        return users.Select(u => new UserDto(u.Id, u.FullName, u.Email, u.Role, u.IsActive, u.CreatedAt));
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var u = await _repo.GetByIdAsync(id);
        return u == null ? null : new UserDto(u.Id, u.FullName, u.Email, u.Role, u.IsActive, u.CreatedAt);
    }

    public async Task<UserDto> UpdateUserStatusAsync(int id, bool isActive)
    {
        var user = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("User not found.");
        user.IsActive = isActive;
        await _repo.UpdateAsync(user);
        return new UserDto(user.Id, user.FullName, user.Email, user.Role, user.IsActive, user.CreatedAt);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
