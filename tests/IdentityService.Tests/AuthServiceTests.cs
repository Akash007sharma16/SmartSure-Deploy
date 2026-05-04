using IdentityService.DTOs;
using IdentityService.Models;
using IdentityService.Repositories;
using IdentityService.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;

namespace IdentityService.Tests;

[TestFixture]
public class AuthServiceTests
{
    private Mock<IUserRepository> _repoMock = null!;
    private Mock<IEmailService> _emailMock = null!;
    private Mock<IOtpService> _otpMock = null!;
    private IAuthService _service = null!;

    [SetUp]
    public void Setup()
    {
        _repoMock  = new Mock<IUserRepository>();
        _emailMock = new Mock<IEmailService>();
        _otpMock   = new Mock<IOtpService>();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "SmartSure_SuperSecret_JWT_Key_2024!@#$%",
                ["Jwt:Issuer"] = "SmartSureApp",
                ["Jwt:Audience"] = "SmartSureClients"
            }).Build();

        _service = new AuthService(_repoMock.Object, config, _emailMock.Object, _otpMock.Object);
    }

    [Test]
    public async Task Register_NewUser_ReturnsToken()
    {
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => { u.Id = 1; return u; });

        var result = await _service.RegisterAsync(new RegisterDto("John Doe", "john@test.com", "Pass123!"));

        Assert.That(result.Token, Is.Not.Empty);
        Assert.That(result.Role, Is.EqualTo("Customer"));
        Assert.That(result.UserId, Is.EqualTo(1));
    }

    [Test]
    public void Register_DuplicateEmail_ThrowsException()
    {
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(new User { Email = "john@test.com" });

        Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.RegisterAsync(new RegisterDto("John", "john@test.com", "Pass123!")));
    }

    [Test]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Pass123!");
        _repoMock.Setup(r => r.GetByEmailAsync("john@test.com"))
            .ReturnsAsync(new User { Id = 1, Email = "john@test.com", PasswordHash = hash, Role = "Customer", FullName = "John", IsActive = true });

        var result = await _service.LoginAsync(new LoginDto("john@test.com", "Pass123!"));

        Assert.That(result.Token, Is.Not.Empty);
        Assert.That(result.Role, Is.EqualTo("Customer"));
    }

    [Test]
    public void Login_WrongPassword_ThrowsUnauthorized()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("CorrectPass");
        _repoMock.Setup(r => r.GetByEmailAsync("john@test.com"))
            .ReturnsAsync(new User { Email = "john@test.com", PasswordHash = hash, IsActive = true });

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.LoginAsync(new LoginDto("john@test.com", "WrongPass")));
    }

    [Test]
    public void Login_InactiveUser_ThrowsUnauthorized()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Pass123!");
        _repoMock.Setup(r => r.GetByEmailAsync("john@test.com"))
            .ReturnsAsync(new User { Email = "john@test.com", PasswordHash = hash, IsActive = false });

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.LoginAsync(new LoginDto("john@test.com", "Pass123!")));
    }

    [Test]
    public void Login_UserNotFound_ThrowsUnauthorized()
    {
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.LoginAsync(new LoginDto("nobody@test.com", "Pass123!")));
    }

    [Test]
    public async Task GetAllUsers_ReturnsUserDtos()
    {
        _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<User>
        {
            new() { Id = 1, FullName = "Alice", Email = "alice@test.com", Role = "Customer", IsActive = true },
            new() { Id = 2, FullName = "Bob", Email = "bob@test.com", Role = "Admin", IsActive = true }
        });

        var result = (await _service.GetAllUsersAsync()).ToList();

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result[0].Email, Is.EqualTo("alice@test.com"));
    }

    [Test]
    public async Task GetUserById_ExistingUser_ReturnsDto()
    {
        _repoMock.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(new User { Id = 1, FullName = "Alice", Email = "alice@test.com", Role = "Customer", IsActive = true });

        var result = await _service.GetUserByIdAsync(1);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Email, Is.EqualTo("alice@test.com"));
    }

    [Test]
    public async Task GetUserById_NotFound_ReturnsNull()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

        var result = await _service.GetUserByIdAsync(99);

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task UpdateUserStatus_ExistingUser_UpdatesStatus()
    {
        var user = new User { Id = 1, FullName = "Alice", Email = "alice@test.com", Role = "Customer", IsActive = true };
        _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);

        var result = await _service.UpdateUserStatusAsync(1, false);

        Assert.That(result.IsActive, Is.False);
    }

    [Test]
    public void UpdateUserStatus_NotFound_ThrowsKeyNotFound()
    {
        _repoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((User?)null);

        Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateUserStatusAsync(99, false));
    }

    [Test]
    public async Task Register_AdminRole_SetsAdminRole()
    {
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => { u.Id = 2; return u; });

        // Role parameter is no longer accepted — all public registrations are hardcoded to "Customer"
        var result = await _service.RegisterAsync(new RegisterDto("Admin User", "admin@test.com", "Pass123!"));

        Assert.That(result.Role, Is.EqualTo("Customer"));
    }

    // ── Forgot Password Tests ─────────────────────────────────────────────────

    [Test]
    public async Task ForgotPassword_ExistingUser_SendsOtp()
    {
        var user = new User { Id = 1, FullName = "Alice", Email = "alice@test.com", IsActive = true };
        _repoMock.Setup(r => r.GetByEmailAsync("alice@test.com")).ReturnsAsync(user);
        _otpMock.Setup(o => o.GenerateAndStoreOtpAsync("alice@test.com")).ReturnsAsync("123456");
        _emailMock.Setup(e => e.SendOtpEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Should not throw
        await _service.ForgotPasswordAsync(new ForgotPasswordDto("alice@test.com"));

        _otpMock.Verify(o => o.GenerateAndStoreOtpAsync("alice@test.com"), Times.Once);
        _emailMock.Verify(e => e.SendOtpEmailAsync("alice@test.com", "Alice", "123456"), Times.Once);
    }

    [Test]
    public async Task ForgotPassword_NonExistentEmail_DoesNotThrow()
    {
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        // Should silently succeed (prevents email enumeration)
        await _service.ForgotPasswordAsync(new ForgotPasswordDto("nobody@test.com"));

        _otpMock.Verify(o => o.GenerateAndStoreOtpAsync(It.IsAny<string>()), Times.Never);
    }

    [Test]
    public async Task VerifyOtp_ValidOtp_ReturnsTrue()
    {
        _otpMock.Setup(o => o.VerifyOtpAsync("alice@test.com", "123456")).ReturnsAsync(true);

        var result = await _service.VerifyOtpAsync(new VerifyOtpDto("alice@test.com", "123456"));

        Assert.That(result, Is.True);
    }

    [Test]
    public async Task VerifyOtp_InvalidOtp_ReturnsFalse()
    {
        _otpMock.Setup(o => o.VerifyOtpAsync("alice@test.com", "000000")).ReturnsAsync(false);

        var result = await _service.VerifyOtpAsync(new VerifyOtpDto("alice@test.com", "000000"));

        Assert.That(result, Is.False);
    }

    [Test]
    public async Task ResetPassword_ValidOtp_UpdatesPassword()
    {
        var user = new User { Id = 1, Email = "alice@test.com", PasswordHash = "old", IsActive = true };
        _otpMock.Setup(o => o.VerifyOtpAsync("alice@test.com", "123456")).ReturnsAsync(true);
        _repoMock.Setup(r => r.GetByEmailAsync("alice@test.com")).ReturnsAsync(user);
        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _otpMock.Setup(o => o.InvalidateOtpAsync("alice@test.com")).Returns(Task.CompletedTask);

        await _service.ResetPasswordAsync(new ResetPasswordDto("alice@test.com", "123456", "NewPass123!"));

        _repoMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.PasswordHash != "old")), Times.Once);
        _otpMock.Verify(o => o.InvalidateOtpAsync("alice@test.com"), Times.Once);
    }

    [Test]
    public void ResetPassword_InvalidOtp_ThrowsUnauthorized()
    {
        _otpMock.Setup(o => o.VerifyOtpAsync("alice@test.com", "000000")).ReturnsAsync(false);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.ResetPasswordAsync(new ResetPasswordDto("alice@test.com", "000000", "NewPass123!")));
    }
}
