using ClaimsService.Models;
using Microsoft.EntityFrameworkCore;

namespace ClaimsService.Data;

public class ClaimsDbContext : DbContext
{
    public ClaimsDbContext(DbContextOptions<ClaimsDbContext> options) : base(options) { }

    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<ClaimDocument> ClaimDocuments => Set<ClaimDocument>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Claim>().Property(c => c.Status).HasConversion<string>();
        modelBuilder.Entity<Claim>().Property(c => c.ClaimAmount).HasPrecision(18, 2);

        // Explicit FK: ClaimDocument → Claim (Cascade delete)
        modelBuilder.Entity<ClaimDocument>()
            .HasOne(cd => cd.Claim)
            .WithMany(c => c.Documents)
            .HasForeignKey(cd => cd.ClaimId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
