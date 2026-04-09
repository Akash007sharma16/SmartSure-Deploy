using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PolicyService.Migrations
{
    /// <inheritdoc />
    public partial class ExplicitForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Policies_PolicyTypes_PolicyTypeId",
                table: "Policies");

            migrationBuilder.AddForeignKey(
                name: "FK_Policies_PolicyTypes_PolicyTypeId",
                table: "Policies",
                column: "PolicyTypeId",
                principalTable: "PolicyTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Policies_PolicyTypes_PolicyTypeId",
                table: "Policies");

            migrationBuilder.AddForeignKey(
                name: "FK_Policies_PolicyTypes_PolicyTypeId",
                table: "Policies",
                column: "PolicyTypeId",
                principalTable: "PolicyTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
