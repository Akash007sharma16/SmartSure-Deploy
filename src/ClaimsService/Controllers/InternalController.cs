using ClaimsService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClaimsService.Controllers;

[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly ClaimsDbContext _ctx;
    private readonly IConfiguration _config;

    public InternalController(ClaimsDbContext ctx, IConfiguration config)
    {
        _ctx = ctx;
        _config = config;
    }

    [HttpGet("claims/count")]
    public async Task<IActionResult> GetClaimCount()
    {
        if (!Request.Headers.TryGetValue("X-Internal-Key", out var key) ||
            key != _config["InternalApi:Key"])
            return Unauthorized(new { message = "Invalid internal key." });

        var count = await _ctx.Claims.CountAsync();
        return Ok(count);

    }

    [HttpGet("claims/pending/count")]
    public async Task<IActionResult> GetPendingClaimCount()
    {
        if (!Request.Headers.TryGetValue("X-Internal-Key", out var key) ||
            key != _config["InternalApi:Key"])
            return Unauthorized(new { message = "Invalid internal key." });

        var count = await _ctx.Claims.CountAsync(c =>
            c.Status == ClaimsService.Models.ClaimStatus.Submitted ||
            c.Status == ClaimsService.Models.ClaimStatus.UnderReview);
        return Ok(count);
    }
}
