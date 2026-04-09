using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PolicyService.DTOs;
using PolicyService.Services;

namespace PolicyService.Controllers;

[ApiController]
[Route("api/policies")]
public class PoliciesController : ControllerBase
{
    private readonly IPolicyService _service;
    public PoliciesController(IPolicyService service) => _service = service;

    [HttpPost("buy")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Buy([FromBody] BuyPolicyDto dto)
    {
        try { return CreatedAtAction(nameof(GetById), new { id = 0 }, await _service.BuyPolicyAsync(dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("{id}/activate")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Activate(int id, [FromBody] int customerId)
    {
        try { return Ok(await _service.ActivatePolicyAsync(id, customerId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("customer/{customerId}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetByCustomer(int customerId) =>
        Ok(await _service.GetCustomerPoliciesAsync(customerId));

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var policy = await _service.GetPolicyByIdAsync(id);
        return policy == null ? NotFound() : Ok(policy);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllPoliciesAsync());

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        try { return Ok(await _service.UpdatePolicyStatusAsync(id, status)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
