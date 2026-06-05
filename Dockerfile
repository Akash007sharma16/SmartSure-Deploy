# Default Dockerfile — builds the API Gateway
# Railway uses this when no specific Dockerfile is specified for a service.
# For individual microservices, specify the Dockerfile in Railway service settings:
#   identity-service  → Dockerfile.identity
#   policy-service    → Dockerfile.policy
#   claims-service    → Dockerfile.claims
#   admin-service     → Dockerfile.admin
#   saga-host         → Dockerfile.sagahost

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/ApiGateway/ApiGateway.csproj", "src/ApiGateway/"]
RUN dotnet restore "src/ApiGateway/ApiGateway.csproj"
COPY . .
WORKDIR "/src/src/ApiGateway"
RUN dotnet build "ApiGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ApiGateway.dll"]
