using System.Text;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PolicyService.Consumers;
using PolicyService.Data;
using PolicyService.Repositories;
using PolicyService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<PolicyDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IPolicyRepository, PolicyRepository>();
builder.Services.AddScoped<IPolicyTypeRepository, PolicyTypeRepository>();
builder.Services.AddScoped<IPremiumRepository, PremiumRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPolicyService, PolicyService.Services.PolicyService>();
builder.Services.AddScoped<IEmailService, PolicyService.Services.EmailService>();

// Named HTTP client for calling IdentityService internal API
builder.Services.AddHttpClient("IdentityService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["InternalServices:IdentityServiceUrl"]
        ?? "https://localhost:7001/");
    client.Timeout = TimeSpan.FromSeconds(5);
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler();
#if DEBUG
    // Allow self-signed dev certificates — remove before production deployment
    handler.ServerCertificateCustomValidationCallback =
        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
#endif
    return handler;
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
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

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Policy Service", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header, Name = "Authorization",
        Type = SecuritySchemeType.Http, Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
    });
});

builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAngular", p =>
        p.WithOrigins("http://localhost:4200", "https://localhost:4200",
                      "https://localhost:7000", "http://localhost:5000")
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials()));

// ── MassTransit + RabbitMQ ────────────────────────────────────────────────────
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<CancelPolicyConsumer>();
    x.AddConsumer<PolicyPurchaseCompletedConsumer>();
    x.AddConsumer<PolicyPurchaseFailedConsumer>();

    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"] ?? "localhost", "/", h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMQ:Password"] ?? "guest");
        });

        // Retry so a temporary RabbitMQ outage doesn't crash the service
        cfg.UseMessageRetry(r => r.Intervals(
            TimeSpan.FromSeconds(5),
            TimeSpan.FromSeconds(15),
            TimeSpan.FromSeconds(30)));

        cfg.ConfigureEndpoints(ctx);
    });
});

var app = builder.Build();
app.UseSwagger(); app.UseSwaggerUI();
app.UseCors("AllowAngular");
app.UseAuthentication(); app.UseAuthorization();
app.MapControllers();
app.Run();
