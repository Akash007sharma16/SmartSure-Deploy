using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PolicyService.DTOs;
using PolicyService.Services;

namespace PolicyService.Controllers;

[ApiController]
[Route("api/policy-types")]
public class PolicyTypesController : ControllerBase
{
    private readonly IPolicyService _service;
    public PolicyTypesController(IPolicyService service) => _service = service;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetPolicyTypesAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePolicyTypeDto dto)
    {
        var result = await _service.CreatePolicyTypeAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { }, result);
    }

    [HttpPost("calculate-premium")]
    [Authorize]
    public async Task<IActionResult> CalculatePremium([FromBody] PremiumCalculationDto dto)
    {
        try { return Ok(await _service.CalculatePremiumAsync(dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
