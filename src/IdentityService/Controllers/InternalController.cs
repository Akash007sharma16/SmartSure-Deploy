using IdentityService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly IdentityDbContext _ctx;
    private readonly IConfiguration _config;

    public InternalController(IdentityDbContext ctx, IConfiguration config)
    {
        _ctx = ctx;
        _config = config;
    }

    [HttpGet("users/count")]
    public async Task<IActionResult> GetUserCount()
    {
        if (!Request.Headers.TryGetValue("X-Internal-Key", out var key) ||
            key != _config["InternalApi:Key"])
            return Unauthorized(new { message = "Invalid internal key." });

        var count = await _ctx.Users.CountAsync();
        return Ok(count);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        if (!Request.Headers.TryGetValue("X-Internal-Key", out var key) ||
            key != _config["InternalApi:Key"])
            return Unauthorized(new { message = "Invalid internal key." });

        var user = await _ctx.Users.FindAsync(id);
        if (user == null) return NotFound();

        return Ok(new { user.Id, user.FullName, user.Email });
    }
}
