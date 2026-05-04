using IdentityService.Models;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Data;

/// <summary>
/// Seeds the default Admin user on first run.
/// Uses BCrypt at runtime so the hash is always valid.
/// Migration failures are logged but never crash the app.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IdentityDbContext db, ILogger logger)
    {
        // Apply any pending migrations — wrapped so a failure never kills startup
        try
        {
            await db.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Migration failed — app will continue with existing schema");
        }

        // Seed Admin user only if it doesn't exist
        try
        {
            if (!await db.Users.AnyAsync(u => u.Email == "admin@smartsure.com"))
            {
                db.Users.Add(new User
                {
                    Id = 1,
                    FullName = "System Administrator",
                    Email = "admin@smartsure.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@SmartSure2024!"),
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });
                await db.SaveChangesAsync();
                logger.LogInformation("Admin user seeded successfully");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Admin seeding failed — app will continue without seeded admin");
        }
    }
}
