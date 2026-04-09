namespace PolicyService.DTOs;

public record PolicyTypeDto(int Id, string Name, string Description, decimal BaseRate, bool IsActive);
public record CreatePolicyTypeDto(string Name, string Description, decimal BaseRate);

public record BuyPolicyDto(int CustomerId, int PolicyTypeId, decimal CoverageAmount, DateTime StartDate, DateTime EndDate);

public record PolicyDto(
    int Id,
    int CustomerId,
    string PolicyNumber,
    string PolicyType,
    decimal CoverageAmount,
    DateTime StartDate,
    DateTime EndDate,
    string Status,
    DateTime CreatedAt,
    decimal PremiumAmount);

public record PremiumDto(int PolicyId, decimal Amount, DateTime CalculatedAt);
public record PremiumCalculationDto(int PolicyTypeId, decimal CoverageAmount);
