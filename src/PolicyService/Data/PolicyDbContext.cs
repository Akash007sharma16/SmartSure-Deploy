using Microsoft.EntityFrameworkCore;
using PolicyService.Models;

namespace PolicyService.Data;

public class PolicyDbContext : DbContext
{
    public PolicyDbContext(DbContextOptions<PolicyDbContext> options) : base(options) { }

    public DbSet<PolicyType> PolicyTypes => Set<PolicyType>();
    public DbSet<Policy> Policies => Set<Policy>();
    public DbSet<Premium> Premiums => Set<Premium>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Policy>().HasIndex(p => p.PolicyNumber).IsUnique();
        modelBuilder.Entity<Policy>().Property(p => p.Status).HasConversion<string>();
        modelBuilder.Entity<Policy>().Property(p => p.CoverageAmount).HasPrecision(18, 2);
        modelBuilder.Entity<Payment>().Property(p => p.Status).HasConversion<string>();
        modelBuilder.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Premium>().Property(p => p.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<PolicyType>().Property(p => p.BaseRate).HasPrecision(5, 2);

        // Explicit FK: Policy → PolicyType (Restrict — don't delete type if policies exist)
        modelBuilder.Entity<Policy>()
            .HasOne(p => p.PolicyType)
            .WithMany()
            .HasForeignKey(p => p.PolicyTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Explicit FK: Premium → Policy (Cascade delete)
        modelBuilder.Entity<Premium>()
            .HasOne(pr => pr.Policy)
            .WithMany(p => p.Premiums)
            .HasForeignKey(pr => pr.PolicyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Explicit FK: Payment → Policy (Cascade delete)
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Policy)
            .WithMany()
            .HasForeignKey(p => p.PolicyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed default policy types
        modelBuilder.Entity<PolicyType>().HasData(
            new PolicyType { Id = 1, Name = "Life Insurance", Description = "Coverage for life events", BaseRate = 0.05m, IsActive = true },
            new PolicyType { Id = 2, Name = "Health Insurance", Description = "Medical expense coverage", BaseRate = 0.08m, IsActive = true },
            new PolicyType { Id = 3, Name = "Vehicle Insurance", Description = "Motor vehicle coverage", BaseRate = 0.06m, IsActive = true }
        );
    }
}
