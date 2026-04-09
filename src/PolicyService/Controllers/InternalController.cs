using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PolicyService.Data;

namespace PolicyService.Controllers;

[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly PolicyDbContext _ctx;
    private readonly IConfiguration _config;

    public InternalController(PolicyDbContext ctx, IConfiguration config)
    {
        _ctx = ctx;
        _config = config;
    }

    [HttpGet("policies/count")]
    public async Task<IActionResult> GetPolicyCount()
    {
        if (!Request.Headers.TryGetValue("X-Internal-Key", out var key) ||
            key != _config["InternalApi:Key"])
            return Unauthorized(new { message = "Invalid internal key." });

        var count = await _ctx.Policies.CountAsync();
        return Ok(count);
    }
}
