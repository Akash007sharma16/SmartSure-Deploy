using MassTransit;
using PolicyService.DTOs;
using PolicyService.Models;
using PolicyService.Repositories;
using SmartSure.Contracts;
using System.Text.Json;

namespace PolicyService.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _policyRepo;
    private readonly IPolicyTypeRepository _typeRepo;
    private readonly IPremiumRepository _premiumRepo;
    private readonly IPaymentRepository _paymentRepo;
    private readonly IPublishEndpoint _publish;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<PolicyService> _logger;

    public PolicyService(
        IPolicyRepository policyRepo,
        IPolicyTypeRepository typeRepo,
        IPremiumRepository premiumRepo,
        IPaymentRepository paymentRepo,
        IPublishEndpoint publish,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<PolicyService> logger)
    {
        _policyRepo = policyRepo;
        _typeRepo = typeRepo;
        _premiumRepo = premiumRepo;
        _paymentRepo = paymentRepo;
        _publish = publish;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task<IEnumerable<PolicyTypeDto>> GetPolicyTypesAsync()
    {
        var types = await _typeRepo.GetAllAsync();
        return types.Select(t => new PolicyTypeDto(t.Id, t.Name, t.Description, t.BaseRate, t.IsActive));
    }

    public async Task<PolicyTypeDto> CreatePolicyTypeAsync(CreatePolicyTypeDto dto)
    {
        var pt = new PolicyType { Name = dto.Name, Description = dto.Description, BaseRate = dto.BaseRate };
        await _typeRepo.CreateAsync(pt);
        return new PolicyTypeDto(pt.Id, pt.Name, pt.Description, pt.BaseRate, pt.IsActive);
    }

    public async Task<bool> DeletePolicyTypeAsync(int id) =>
        await _typeRepo.DeleteAsync(id);

    public async Task<PolicyDto> BuyPolicyAsync(BuyPolicyDto dto)
    {
        var policyType = await _typeRepo.GetByIdAsync(dto.PolicyTypeId)
            ?? throw new KeyNotFoundException("Policy type not found.");

        var policy = new Policy
        {
            CustomerId = dto.CustomerId,
            PolicyTypeId = dto.PolicyTypeId,
            PolicyNumber = $"POL-{DateTime.UtcNow.Ticks}",
            CoverageAmount = dto.CoverageAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = PolicyStatus.Draft
        };

        await _policyRepo.CreateAsync(policy);

        var premiumAmount = dto.CoverageAmount * (policyType.BaseRate / 100);
        await _premiumRepo.CreateAsync(new Premium { PolicyId = policy.Id, Amount = premiumAmount });

        // Fetch customer details from IdentityService for email notifications (non-blocking)
        var (customerEmail, customerName) = await GetCustomerDetailsAsync(dto.CustomerId);

        // Publish event for saga (non-blocking — works even if RabbitMQ is down)
        try
        {
            await _publish.Publish(new PolicyCreated(
                Guid.NewGuid(), policy.Id, policy.CustomerId, policy.PolicyTypeId,
                policy.CoverageAmount, policy.StartDate, policy.EndDate,
                customerEmail, customerName, policyType.Name));
        }
        catch { /* RabbitMQ unavailable — saga event skipped, core flow continues */ }

        return MapToDto(policy, policyType.Name);
    }

    /// <summary>
    /// Fetches customer email and name from IdentityService via internal API.
    /// Returns empty strings on failure — email is best-effort, never blocks the purchase.
    /// </summary>
    private async Task<(string Email, string Name)> GetCustomerDetailsAsync(int customerId)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("IdentityService");
            var internalKey = _config["InternalApi:Key"] ?? "";
            client.DefaultRequestHeaders.Add("X-Internal-Key", internalKey);

            var response = await client.GetAsync($"api/internal/users/{customerId}");
            if (!response.IsSuccessStatusCode) return ("", "");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            var email = root.TryGetProperty("email", out var e) ? e.GetString() ?? "" : "";
            var name  = root.TryGetProperty("fullName", out var n) ? n.GetString() ?? "" : "";
            return (email, name);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not fetch customer details for CustomerId {Id} — email notification skipped", customerId);
            return ("", "");
        }
    }

    public async Task<PolicyDto> ActivatePolicyAsync(int id, int customerId)
    {
        var policy = await _policyRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (policy.CustomerId != customerId)
            throw new UnauthorizedAccessException("Not your policy.");

        if (policy.Status != PolicyStatus.Draft)
            throw new InvalidOperationException("Only Draft policies can be activated.");

        policy.Status = PolicyStatus.Active;
        await _policyRepo.UpdateAsync(policy);

        // FIX 7: Record payment when policy is activated
        var premium = policy.Premiums.OrderByDescending(p => p.CalculatedAt).FirstOrDefault();
        if (premium != null)
        {
            await _paymentRepo.CreateAsync(new Payment
            {
                PolicyId = policy.Id,
                Amount = premium.Amount,
                Status = PaymentStatus.Completed,
                PaidAt = DateTime.UtcNow
            });
        }

        // Publish events for saga (non-blocking — works even if RabbitMQ is down)
        try
        {
            var correlationId = Guid.NewGuid();
            await _publish.Publish(new PolicyActivated(correlationId, policy.Id, policy.CustomerId));
            if (premium != null)
                await _publish.Publish(new PaymentRecorded(correlationId, policy.Id, premium.Amount, DateTime.UtcNow));
        }
        catch { /* RabbitMQ unavailable — saga event skipped, core flow continues */ }

        return MapToDto(policy, policy.PolicyType.Name);
    }

    public async Task<IEnumerable<PolicyDto>> GetCustomerPoliciesAsync(int customerId)
    {
        var policies = await _policyRepo.GetByCustomerIdAsync(customerId);
        return policies.Select(p => MapToDto(p, p.PolicyType.Name));
    }

    public async Task<PolicyDto?> GetPolicyByIdAsync(int id)
    {
        var p = await _policyRepo.GetByIdAsync(id);
        if (p == null) return null;
        if (p.Status == PolicyStatus.Active && p.EndDate < DateTime.UtcNow)
        {
            p.Status = PolicyStatus.Expired;
            await _policyRepo.UpdateAsync(p);
        }
        return MapToDto(p, p.PolicyType.Name);
    }

    public async Task<IEnumerable<PolicyDto>> GetAllPoliciesAsync()
    {
        var policies = await _policyRepo.GetAllAsync();
        foreach (var p in policies.Where(p => p.Status == PolicyStatus.Active && p.EndDate < DateTime.UtcNow))
        {
            p.Status = PolicyStatus.Expired;
            await _policyRepo.UpdateAsync(p);
        }
        return policies.Select(p => MapToDto(p, p.PolicyType.Name));
    }

    public async Task<PolicyDto> UpdatePolicyStatusAsync(int id, string status)
    {
        var policy = await _policyRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Policy not found.");

        if (!Enum.TryParse<PolicyStatus>(status, true, out var newStatus))
            throw new ArgumentException("Invalid status.");

        // ── Lifecycle transition guard ────────────────────────────────────────
        var validTransitions = new Dictionary<PolicyStatus, PolicyStatus[]>
        {
            [PolicyStatus.Draft]     = [PolicyStatus.Active],
            [PolicyStatus.Active]    = [PolicyStatus.Expired, PolicyStatus.Cancelled],
            [PolicyStatus.Expired]   = [],
            [PolicyStatus.Cancelled] = []
        };

        if (!validTransitions.TryGetValue(policy.Status, out var allowed) || !allowed.Contains(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition from {policy.Status} to {newStatus}.");

        policy.Status = newStatus;
        await _policyRepo.UpdateAsync(policy);
        return MapToDto(policy, policy.PolicyType.Name);
    }

    public async Task<PremiumDto> CalculatePremiumAsync(PremiumCalculationDto dto)
    {
        var policyType = await _typeRepo.GetByIdAsync(dto.PolicyTypeId)
            ?? throw new KeyNotFoundException("Policy type not found.");

        var amount = dto.CoverageAmount * (policyType.BaseRate / 100);
        return new PremiumDto(0, amount, DateTime.UtcNow);
    }

    private static PolicyDto MapToDto(Policy p, string typeName) =>
        new(p.Id, p.CustomerId, p.PolicyNumber, typeName,
            p.CoverageAmount, p.StartDate, p.EndDate, p.Status.ToString(), p.CreatedAt,
            p.Premiums.OrderByDescending(pr => pr.CalculatedAt).FirstOrDefault()?.Amount ?? 0);
}
