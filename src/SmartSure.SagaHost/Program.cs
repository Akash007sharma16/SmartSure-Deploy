using MassTransit;
using SmartSure.Sagas;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((ctx, services) =>
    {
        var rabbitHost = ctx.Configuration["RabbitMQ:Host"] ?? "localhost";
        var rabbitUser = ctx.Configuration["RabbitMQ:Username"] ?? "guest";
        var rabbitPass = ctx.Configuration["RabbitMQ:Password"] ?? "guest";

        services.AddMassTransit(x =>
        {
            // Register both saga state machines with in-memory repository
            // (swap to EF Core / Redis repository for production)
            x.AddSagaStateMachine<PolicyPurchaseSaga, PolicyPurchaseSagaState>()
             .InMemoryRepository();

            x.AddSagaStateMachine<ClaimApprovalSaga, ClaimApprovalSagaState>()
             .InMemoryRepository();

            x.UsingRabbitMq((ctx, cfg) =>
            {
                cfg.Host(rabbitHost, "/", h =>
                {
                    h.Username(rabbitUser);
                    h.Password(rabbitPass);
                });

                cfg.ConfigureEndpoints(ctx);
            });
        });
    })
    .Build();

await host.RunAsync();
