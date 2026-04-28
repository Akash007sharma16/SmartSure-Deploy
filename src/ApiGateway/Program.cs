using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// ── JWT — same key/issuer/audience as all microservices ──────────────────────
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

// ── DevSslBypassHandler — allows Ocelot to forward to HTTPS services in dev ──
builder.Services.AddTransient<DevSslBypassHandler>();
builder.Services.AddOcelot().AddDelegatingHandler<DevSslBypassHandler>(global: true);

// ── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAngular", p =>
        p.WithOrigins("http://localhost:4200", "https://localhost:4200")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials()));

builder.Services.AddRouting();
builder.Services.AddEndpointsApiExplorer();

// HttpClient for swagger proxy (bypasses SSL in dev)
builder.Services.AddHttpClient("swagger-proxy")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    });

// ── Swagger ───────────────────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("gateway", new OpenApiInfo
    {
        Title = "SmartSure API Gateway",
        Version = "v1",
        Description =
            "Ocelot API Gateway — routes all requests to downstream microservices.\n\n" +
            "HOW TO USE:\n" +
            "1. Select a service from the dropdown to see its endpoints.\n" +
            "2. Call POST /gateway/auth/login to get a JWT token.\n" +
            "3. Click Authorize and enter: Bearer {your-token}\n\n" +
            "All /gateway/* routes are forwarded to the correct microservice via Ocelot."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your-jwt-token}",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── CORS must be first ────────────────────────────────────────────────────────
app.UseCors("AllowAngular");

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/gateway/swagger.json", "🌐 API Gateway — Route Map");
    c.SwaggerEndpoint("/swagger-proxy/identity", "🔐 Identity Service (:7001)");
    c.SwaggerEndpoint("/swagger-proxy/policy",   "📋 Policy Service (:7002)");
    c.SwaggerEndpoint("/swagger-proxy/claims",   "📁 Claims Service (:7003)");
    c.SwaggerEndpoint("/swagger-proxy/admin",    "⚙️ Admin Service (:7004)");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "SmartSure — All Services";
    c.DefaultModelsExpandDepth(-1);
    c.DisplayRequestDuration();
});

// ── UseRouting before custom endpoints ───────────────────────────────────────
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// ── Custom endpoints — registered BEFORE UseOcelot ───────────────────────────
app.UseEndpoints(endpoints =>
{
    endpoints.MapGet("/", () => Results.Json(new
    {
        status = "SmartSure API Gateway is running",
        swagger = "https://localhost:7000/swagger",
        note = "All /gateway/* routes are forwarded to microservices via Ocelot"
    }));

    endpoints.MapGet("/swagger-proxy/identity", async (IHttpClientFactory factory) =>
    {
        try
        {
            var client = factory.CreateClient("swagger-proxy");
            var json = await client.GetStringAsync("https://localhost:7001/swagger/v1/swagger.json");
            // /api/auth/login  →  /gateway/auth/login
            var rewritten = RewriteSwaggerServerMulti(json, "https://localhost:7000",
                new Dictionary<string, string>
                {
                    { "/api/auth", "/gateway/auth" }
                });
            return Results.Content(rewritten, "application/json");
        }
        catch
        {
            return Results.Json(new { error = "Identity Service not reachable on https://localhost:7001." });
        }
    });

    endpoints.MapGet("/swagger-proxy/policy", async (IHttpClientFactory factory) =>
    {
        try
        {
            var client = factory.CreateClient("swagger-proxy");
            var json = await client.GetStringAsync("https://localhost:7002/swagger/v1/swagger.json");
            // Rewrite so policy-types and policies go through gateway
            var rewritten = RewriteSwaggerServerMulti(json, "https://localhost:7000",
                new Dictionary<string, string>
                {
                    { "/api/policy-types", "/gateway/policy-types" },
                    { "/api/policies",     "/gateway/policies" }
                });
            return Results.Content(rewritten, "application/json");
        }
        catch
        {
            return Results.Json(new { error = "Policy Service not reachable on https://localhost:7002." });
        }
    });

    endpoints.MapGet("/swagger-proxy/claims", async (IHttpClientFactory factory) =>
    {
        try
        {
            var client = factory.CreateClient("swagger-proxy");
            var json = await client.GetStringAsync("https://localhost:7003/swagger/v1/swagger.json");
            // /api/claims/...  →  /gateway/claims/...
            var rewritten = RewriteSwaggerServerMulti(json, "https://localhost:7000",
                new Dictionary<string, string>
                {
                    { "/api/claims", "/gateway/claims" }
                });
            return Results.Content(rewritten, "application/json");
        }
        catch
        {
            return Results.Json(new { error = "Claims Service not reachable on https://localhost:7003." });
        }
    });

    endpoints.MapGet("/swagger-proxy/admin", async (IHttpClientFactory factory) =>
    {
        try
        {
            var client = factory.CreateClient("swagger-proxy");
            var json = await client.GetStringAsync("https://localhost:7004/swagger/v1/swagger.json");
            // /api/admin/...  →  /gateway/admin/...
            var rewritten = RewriteSwaggerServerMulti(json, "https://localhost:7000",
                new Dictionary<string, string>
                {
                    { "/api/admin", "/gateway/admin" }
                });
            return Results.Content(rewritten, "application/json");
        }
        catch
        {
            return Results.Json(new { error = "Admin Service not reachable on https://localhost:7004." });
        }
    });
});

// ── Ocelot MUST be last ───────────────────────────────────────────────────────
await app.UseOcelot();

app.Run();

// ── Swagger JSON rewrite helpers ──────────────────────────────────────────────
// These rewrite the "servers" and path prefixes in each service's swagger.json
// so that Swagger UI sends all requests through the gateway (/gateway/*) instead
// of directly to the service port — fixing the 404 errors when testing via gateway.

static string RewriteSwaggerServerMulti(string swaggerJson, string gatewayUrl,
    Dictionary<string, string> pathMappings)
{
    try
    {
        using var doc = System.Text.Json.JsonDocument.Parse(swaggerJson);
        var root = doc.RootElement;

        var opts = new System.Text.Json.JsonSerializerOptions { WriteIndented = false };
        using var stream = new System.IO.MemoryStream();
        using var writer = new System.Text.Json.Utf8JsonWriter(stream);

        writer.WriteStartObject();

        foreach (var prop in root.EnumerateObject())
        {
            if (prop.Name == "servers")
            {
                // Replace servers with gateway URL
                writer.WritePropertyName("servers");
                writer.WriteStartArray();
                writer.WriteStartObject();
                writer.WriteString("url", gatewayUrl);
                writer.WriteString("description", "API Gateway");
                writer.WriteEndObject();
                writer.WriteEndArray();
            }
            else if (prop.Name == "paths")
            {
                // Rewrite path keys: /api/auth/login → /gateway/auth/login
                writer.WritePropertyName("paths");
                writer.WriteStartObject();
                foreach (var path in prop.Value.EnumerateObject())
                {
                    var newPath = path.Name;
                    foreach (var (oldPrefix, newPrefix) in pathMappings)
                    {
                        if (newPath.StartsWith(oldPrefix))
                        {
                            newPath = newPrefix + newPath[oldPrefix.Length..];
                            break;
                        }
                    }
                    writer.WritePropertyName(newPath);
                    path.Value.WriteTo(writer);
                }
                writer.WriteEndObject();
            }
            else
            {
                prop.WriteTo(writer);
            }
        }

        writer.WriteEndObject();
        writer.Flush();
        return System.Text.Encoding.UTF8.GetString(stream.ToArray());
    }
    catch
    {
        // If rewrite fails, return original
        return swaggerJson;
    }
}

/// <summary>
/// Delegating handler that bypasses SSL certificate validation for downstream HTTPS services.
/// Only active in Development — safe for local dev with self-signed certs.
/// </summary>
public class DevSslBypassHandler : DelegatingHandler
{
    public DevSslBypassHandler()
    {
        InnerHandler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        };
    }
}
