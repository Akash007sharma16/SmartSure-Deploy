using ClaimsService.DTOs;
using ClaimsService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ClaimsService.Controllers;

[ApiController]
[Route("api/claims")]
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _service;
    public ClaimsController(IClaimService service) => _service = service;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Initiate([FromBody] InitiateClaimDto dto)
    {
        var result = await _service.InitiateClaimAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Submit(int id)
    {
        // Ownership check — verify the claim belongs to the authenticated customer
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var authenticatedUserId))
            return Unauthorized(new { message = "Invalid token." });

        var claim = await _service.GetClaimByIdAsync(id);
        if (claim == null) return NotFound(new { message = "Claim not found." });

        if (claim.CustomerId != authenticatedUserId)
            return StatusCode(403, new { message = "You are not authorised to submit this claim." });

        try { return Ok(await _service.SubmitClaimAsync(id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("customer/{customerId}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetByCustomer(int customerId) =>
        Ok(await _service.GetCustomerClaimsAsync(customerId));

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var claim = await _service.GetClaimByIdAsync(id);
        return claim == null ? NotFound() : Ok(claim);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllClaimsAsync());

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateClaimStatusDto dto)
    {
        try { return Ok(await _service.UpdateClaimStatusAsync(id, dto)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id}/documents")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> UploadDocument(int id, IFormFile file)
    {
        try { return Ok(await _service.UploadDocumentAsync(id, file)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("{id}/documents")]
    [Authorize]
    public async Task<IActionResult> GetDocuments(int id) =>
        Ok(await _service.GetDocumentsAsync(id));
}
