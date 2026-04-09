namespace AdminService.Models;

public class Report
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty; // Claims | Policies | Users
    public string Data { get; set; } = string.Empty;       // JSON snapshot
    public int GeneratedBy { get; set; }                   // Admin UserId
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
