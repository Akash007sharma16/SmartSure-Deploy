namespace PolicyService.Models;

public class PolicyType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;       // e.g. Health, Auto, Life
    public string Description { get; set; } = string.Empty;
    public decimal BaseRate { get; set; }                   // base premium rate %
    public bool IsActive { get; set; } = true;
}
