using IdentityService.DTOs;
using IdentityService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;
    public AuthController(IAuthService service) => _service = service;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _service.RegisterAsync(dto);
            return CreatedAtAction(nameof(GetUser), new { id = result.UserId }, result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _service.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers() =>
        Ok(await _service.GetAllUsersAsync());

    [HttpGet("users/{id}")]
    [Authorize]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _service.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPatch("users/{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
    {
        try { return Ok(await _service.UpdateUserStatusAsync(id, isActive)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ── Forgot Password Endpoints ─────────────────────────────────────────────

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _service.ForgotPasswordAsync(dto);
        // Always return 200 to prevent email enumeration
        return Ok(new { message = "If that email is registered, an OTP has been sent." });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        try
        {
            var valid = await _service.VerifyOtpAsync(dto);
            return valid
                ? Ok(new { message = "OTP verified successfully." })
                : BadRequest(new { message = "Invalid OTP. Please try again." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        try
        {
            await _service.ResetPasswordAsync(dto);
            return Ok(new { message = "Password reset successfully. You can now log in." });
        }
        catch (UnauthorizedAccessException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
