using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PolicyService.Migrations
{
    /// <inheritdoc />
    public partial class SeedPolicyTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "PolicyTypes",
                columns: new[] { "Id", "BaseRate", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, 0.05m, "Coverage for life events", true, "Life Insurance" },
                    { 2, 0.08m, "Medical expense coverage", true, "Health Insurance" },
                    { 3, 0.06m, "Motor vehicle coverage", true, "Vehicle Insurance" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PolicyTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PolicyTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PolicyTypes",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
