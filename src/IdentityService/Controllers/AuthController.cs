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
}
