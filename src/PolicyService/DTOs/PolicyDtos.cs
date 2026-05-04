using System.ComponentModel.DataAnnotations;

namespace PolicyService.DTOs;

public record PolicyTypeDto(int Id, string Name, string Description, decimal BaseRate, bool IsActive);

public record CreatePolicyTypeDto(
    [Required(ErrorMessage = "Policy type name is required.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters.")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-]+$", ErrorMessage = "Name can only contain letters, numbers, spaces, and hyphens.")]
    string Name,

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 500 characters.")]
    string Description,

    [Required(ErrorMessage = "Base rate is required.")]
    [Range(0.1, 100.0, ErrorMessage = "Base rate must be between 0.1% and 100%.")]
    decimal BaseRate
);

public record BuyPolicyDto(
    [Required] int CustomerId,
    [Required] int PolicyTypeId,

    [Required(ErrorMessage = "Coverage amount is required.")]
    [Range(1000, 100000000, ErrorMessage = "Coverage amount must be between ₹1,000 and ₹10,00,00,000.")]
    decimal CoverageAmount,

    [Required(ErrorMessage = "Start date is required.")]
    DateTime StartDate,

    [Required(ErrorMessage = "End date is required.")]
    DateTime EndDate
);

public record PolicyDto(
    int Id, int CustomerId, string PolicyNumber, string PolicyType,
    decimal CoverageAmount, DateTime StartDate, DateTime EndDate,
    string Status, DateTime CreatedAt, decimal PremiumAmount);

public record PremiumDto(int PolicyId, decimal Amount, DateTime CalculatedAt);

public record PremiumCalculationDto(
    [Required] int PolicyTypeId,
    [Range(1000, 100000000)] decimal CoverageAmount
);
