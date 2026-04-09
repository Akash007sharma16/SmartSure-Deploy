using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true,
            ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddOcelot();

builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint — must be BEFORE UseOcelot so Ocelot doesn't intercept it
app.MapGet("/", () => Results.Json(new {
    status = "SmartSure API Gateway is running",
    version = "1.0",
    timestamp = DateTime.UtcNow,
    http_url = "http://localhost:5000",
    https_url = "https://localhost:7000",
    note = "Use http://localhost:5000 if HTTPS certificate is not trusted",
    routes = new[] {
        "POST /gateway/auth/register  (public)",
        "POST /gateway/auth/login     (public)",
        "GET  /gateway/policies       (JWT required)",
        "GET  /gateway/claims         (JWT required)",
        "GET  /gateway/admin/dashboard (Admin JWT required)"
    }
}));

await app.UseOcelot();

app.Run();
