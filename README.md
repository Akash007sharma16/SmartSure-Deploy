# SmartSure Insurance Management System

A full-stack insurance management platform built with a .NET 8 microservices backend and an Angular 21 frontend. The system handles user authentication, policy management, claims processing, document uploads, and administrative reporting through a clean Ocelot API Gateway architecture.

> **Solution file:** `SmartSure_InsuranceApp.slnx`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Getting the Project](#2-getting-the-project)
3. [Database Setup](#3-database-setup)
4. [Backend Configuration](#4-backend-configuration)
5. [Running the Backend (5 Projects)](#5-running-the-backend-5-projects)
6. [Running the Angular Frontend](#6-running-the-angular-frontend)
7. [First Time Setup](#7-first-time-setup)
8. [Complete User Flows](#8-complete-user-flows)
9. [Running the Tests](#9-running-the-tests)
10. [Swagger API Testing](#10-swagger-api-testing)
11. [Troubleshooting](#11-troubleshooting)
12. [Ports Quick Reference](#12-ports-quick-reference)
13. [Project Folder Structure](#13-project-folder-structure)
14. [Changelog](#14-changelog)
---

## 1. Prerequisites

Before running SmartSure, ensure every tool below is installed and working. Missing any one of these will prevent the system from starting correctly.

### 1.1 Required Software

| Tool | Version Required | Download |
|------|-----------------|----------|
| .NET SDK | 8.x | https://dotnet.microsoft.com/download/dotnet/8.0 |
| Node.js | v24 or higher | https://nodejs.org/ |
| npm | 11 or higher | Bundled with Node.js |
| Angular CLI | ^21.2.6 | `npm install -g @angular/cli@^21.2.6` |
| SQL Server | Express or Developer Edition | https://www.microsoft.com/en-us/sql-server/sql-server-downloads |
| SSMS | 19 or higher | https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms |
| Visual Studio | 2022 (any edition) | https://visualstudio.microsoft.com/ |
| VS Code | Latest | https://code.visualstudio.com/ |

### 1.2 Visual Studio 2022 Workloads

When installing Visual Studio 2022, ensure the following workload is selected:

- **ASP.NET and web development** � required for running and debugging .NET 8 microservices

### 1.3 EF Core CLI Tools

The project uses a `dotnet-tools.json` manifest at the solution root. After cloning, restore the tools with:

```bash
dotnet tool restore
```

This installs `dotnet-ef` (Entity Framework Core CLI) at the correct version for running migrations.

### 1.4 Verify All Installations

Run these commands in a terminal to confirm everything is installed correctly:

```bash
dotnet --version
```
Expected output: `8.x.x` (e.g., `8.0.404`)

```bash
node --version
```
Expected output: `v24.x.x` (e.g., `v24.0.0`)

```bash
npm --version
```
Expected output: `11.x.x` (e.g., `11.0.0`)

```bash
ng version
```
Expected output includes:
```
Angular CLI: 21.2.6
Node: 24.x.x
Package Manager: npm 11.x.x
```

```bash
dotnet ef --version
```
Expected output: `9.x.x` or the version specified in `dotnet-tools.json`

If `ng version` fails with "command not found", install Angular CLI globally:

```bash
npm install -g @angular/cli@^21.2.6
```

---

## 2. Getting the Project

### 2.1 Clone or Extract the Repository

If the project is in a Git repository:

```bash
git clone <repository-url>
cd SmartSure_InsuranceApp
```

If you received the project as a ZIP archive:

1. Extract the ZIP to a folder of your choice (e.g., `D:\Projects\SmartSure_InsuranceApp`).
2. Open a terminal and navigate to the extracted folder:

```bash
cd D:\Projects\SmartSure_InsuranceApp
```

### 2.2 Open the Solution

The solution file is located at the root of the repository:

```
SmartSure_InsuranceApp.slnx
```

Open it in Visual Studio 2022 by double-clicking the file or using **File ? Open ? Project/Solution** from within Visual Studio.

### 2.3 Restore .NET Tool Manifest

From the solution root, restore the EF Core CLI tool:

```bash
dotnet tool restore
```

Expected output:
```
Tool 'dotnet-ef' (version 'x.x.x') was restored. Available commands: dotnet-ef
Restore was successful.
```

### 2.4 Restore NuGet Packages

Visual Studio restores NuGet packages automatically when you open the solution. To restore manually from the CLI:

```bash
dotnet restore
```

Expected output:
```
Restore complete (x.xxs)
```

### 2.5 Install Angular Dependencies

Navigate to the Angular project folder and install npm packages:

```bash
cd smartsure-ui
npm install
```

Expected output ends with something like:
```
added 1234 packages, and audited 1235 packages in 45s
found 0 vulnerabilities
```

> If you see peer dependency warnings, they are generally safe to ignore for development. Only act on them if `ng serve` fails.

---

## 3. Database Setup

SmartSure uses four separate SQL Server databases � one per microservice. Each database is created and migrated independently using Entity Framework Core.

### 3.1 SQL Server Instance

Identify your SQL Server instance name. Common examples:

| Scenario | Instance Name |
|----------|--------------|
| SQL Server Express (default) | `YOUR_PC_NAME\SQLEXPRESS` |
| SQL Server Developer (default) | `YOUR_PC_NAME\MSSQLSERVER` or just `.` |
| Named instance | `YOUR_PC_NAME\INSTANCENAME` |

To find your instance name, open SSMS and check the "Server name" field in the connection dialog. It will look like `LAPTOP-6AC40P6B\SQLEXPRESS`.

### 3.2 Connection String Template

All four services use Windows Authentication (Integrated Security). Replace `YOUR_SERVER\SQLEXPRESS` with your actual instance name in every `appsettings.json`:

```
Data Source=YOUR_SERVER\SQLEXPRESS;Initial Catalog=DATABASE_NAME;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;
```

### 3.3 The Four Databases

| Database Name | Microservice | Tables Created |
|---------------|-------------|----------------|
| `SmartSureAppDb_Identity` | IdentityService | `Users`, `__EFMigrationsHistory` |
| `SmartSureAppDb_Policy` | PolicyService | `PolicyTypes`, `Policies`, `Premiums`, `Payments`, `__EFMigrationsHistory` |
| `SmartSureAppDb_Claims` | ClaimsService | `Claims`, `ClaimDocuments`, `__EFMigrationsHistory` |
| `SmartSureAppDb_Admin` | AdminService | `Reports`, `__EFMigrationsHistory` |

> You do NOT need to create these databases manually. EF Core migrations create them automatically.

### 3.4 Running All Migrations

Open a terminal at the solution root and run each command in order:

```bash
# Step 1 � Identity database (creates SmartSureAppDb_Identity)
dotnet ef database update --project src/IdentityService
```

Expected output:
```
Build started...
Build succeeded.
Applying migration '20260405170330_InitialCreate'.
Done.
```

```bash
# Step 2 � Policy database (creates SmartSureAppDb_Policy + seeds 3 PolicyTypes)
dotnet ef database update --project src/PolicyService
```

Expected output:
```
Build started...
Build succeeded.
Applying migration '20260405170954_InitialCreate'.
Applying migration '20260406045954_AddDecimalPrecision'.
Applying migration '20260406063612_ExplicitForeignKeys'.
Applying migration '20260406072825_AddPremiumsNavigation'.
Applying migration '20260406090112_SeedPolicyTypes'.
Done.
```

```bash
# Step 3 � Claims database (creates SmartSureAppDb_Claims)
dotnet ef database update --project src/ClaimsService
```

Expected output:
```
Build started...
Build succeeded.
Applying migration '20260405172618_InitialCreate'.
Applying migration '20260406050019_AddDecimalPrecision'.
Applying migration '20260406063412_ExplicitForeignKeys'.
Done.
```

```bash
# Step 4 � Admin database (creates SmartSureAppDb_Admin)
dotnet ef database update --project src/AdminService
```

Expected output:
```
Build started...
Build succeeded.
Applying migration '20260405172734_InitialCreate'.
Done.
```

### 3.5 Complete Migration History

| Service | Migration Name | Purpose |
|---------|---------------|---------|
| IdentityService | `20260405170330_InitialCreate` | Creates `Users` table |
| PolicyService | `20260405170954_InitialCreate` | Creates `PolicyTypes`, `Policies` tables |
| PolicyService | `20260406045954_AddDecimalPrecision` | Adjusts decimal column precision |
| PolicyService | `20260406063612_ExplicitForeignKeys` | Adds explicit FK constraints |
| PolicyService | `20260406072825_AddPremiumsNavigation` | Adds `Premiums` and `Payments` tables |
| PolicyService | `20260406090112_SeedPolicyTypes` | Inserts 3 default policy types |
| ClaimsService | `20260405172618_InitialCreate` | Creates `Claims`, `ClaimDocuments` tables |
| ClaimsService | `20260406050019_AddDecimalPrecision` | Adjusts decimal column precision |
| ClaimsService | `20260406063412_ExplicitForeignKeys` | Adds explicit FK constraints |
| AdminService | `20260405172734_InitialCreate` | Creates `Reports` table |

### 3.6 Seeded Policy Types

The `20260406090112_SeedPolicyTypes` migration automatically inserts these rows into the `PolicyTypes` table in `SmartSureAppDb_Policy`:

| ID | Name | Description | BaseRate |
|----|------|-------------|----------|
| 1 | Life Insurance | Coverage for life events | 0.05 (5%) |
| 2 | Health Insurance | Medical expense coverage | 0.08 (8%) |
| 3 | Vehicle Insurance | Motor vehicle coverage | 0.06 (6%) |

These rows are required for the "Buy Policy" wizard to display available policy types. If this table is empty, the wizard will show no options.

### 3.7 Verify Databases in SSMS

After running all migrations, open SSMS and connect to your SQL Server instance. You should see all four databases in the Object Explorer:

```
YOUR_SERVER\SQLEXPRESS
  +-- Databases
        +-- SmartSureAppDb_Admin
        +-- SmartSureAppDb_Claims
        +-- SmartSureAppDb_Identity
        +-- SmartSureAppDb_Policy
```

Expand `SmartSureAppDb_Policy ? Tables` to confirm the `PolicyTypes` table has 3 rows:

```sql
SELECT * FROM PolicyTypes;
-- Should return 3 rows: Life Insurance, Health Insurance, Vehicle Insurance
```

---

## 4. Backend Configuration

Each of the five backend projects has its own `appsettings.json`. You must update the connection strings in all four microservices before running the application. The JWT settings and internal API key must be identical across all services.

### 4.1 Update Connection Strings

Open each `appsettings.json` file and replace `YOUR_SERVER\SQLEXPRESS` with your actual SQL Server instance name.

**`src/IdentityService/appsettings.json`**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER\\SQLEXPRESS;Initial Catalog=SmartSureAppDb_Identity;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Key": "SmartSure_SuperSecret_JWT_Key_2024!@#$%",
    "Issuer": "SmartSureApp",
    "Audience": "SmartSureClients",
    "ExpiryHours": 8
  },
  "InternalApiKey": "SmartSure_Internal_Key_XYZ_2024"
}
```

**`src/PolicyService/appsettings.json`**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER\\SQLEXPRESS;Initial Catalog=SmartSureAppDb_Policy;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Key": "SmartSure_SuperSecret_JWT_Key_2024!@#$%",
    "Issuer": "SmartSureApp",
    "Audience": "SmartSureClients",
    "ExpiryHours": 8
  },
  "InternalApiKey": "SmartSure_Internal_Key_XYZ_2024"
}
```

**`src/ClaimsService/appsettings.json`**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER\\SQLEXPRESS;Initial Catalog=SmartSureAppDb_Claims;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Key": "SmartSure_SuperSecret_JWT_Key_2024!@#$%",
    "Issuer": "SmartSureApp",
    "Audience": "SmartSureClients",
    "ExpiryHours": 8
  },
  "InternalApiKey": "SmartSure_Internal_Key_XYZ_2024"
}
```

**`src/AdminService/appsettings.json`**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER\\SQLEXPRESS;Initial Catalog=SmartSureAppDb_Admin;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Key": "SmartSure_SuperSecret_JWT_Key_2024!@#$%",
    "Issuer": "SmartSureApp",
    "Audience": "SmartSureClients",
    "ExpiryHours": 8
  },
  "InternalApiKey": "SmartSure_Internal_Key_XYZ_2024"
}
```

### 4.2 JWT Settings � Critical Rules

The following JWT values are used by every service to sign and validate tokens. They **must be identical** across all five projects (IdentityService, PolicyService, ClaimsService, AdminService, and ApiGateway):

| Setting | Value |
|---------|-------|
| Key | `SmartSure_SuperSecret_JWT_Key_2024!@#$%` |
| Issuer | `SmartSureApp` |
| Audience | `SmartSureClients` |
| ExpiryHours | `8` (tokens expire 8 hours after issue) |

> **Warning:** If any service has a different `Key`, `Issuer`, or `Audience`, JWT validation will fail and all authenticated requests will return `401 Unauthorized`. Double-check every `appsettings.json` file.

### 4.3 Internal API Key

The `AdminService` makes direct HTTP calls to other microservices (bypassing the Ocelot gateway) to aggregate statistics for the admin dashboard and reports. These calls use a shared secret header instead of a JWT:

```
Header name:  X-Internal-Key
Header value: SmartSure_Internal_Key_XYZ_2024
```

The `InternalController` in each downstream service validates this header before responding. The key must match in all `appsettings.json` files under `"InternalApiKey"`.

Internal endpoints called by AdminService:

| Endpoint | Service | Purpose |
|----------|---------|---------|
| `GET https://localhost:7001/api/internal/users/count` | IdentityService | Total registered users |
| `GET https://localhost:7002/api/internal/policies/count` | PolicyService | Total active policies |
| `GET https://localhost:7003/api/internal/claims/count` | ClaimsService | Total claims submitted |
| `GET https://localhost:7003/api/internal/claims/pending/count` | ClaimsService | Claims awaiting review |

### 4.4 File Upload Configuration

The ClaimsService handles document uploads for claim evidence. The following limits are enforced server-side:

| Setting | Value |
|---------|-------|
| Maximum file size | 10 MB per file |
| Allowed MIME types | `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Allowed extensions | `.pdf`, `.jpg`, `.png`, `.doc`, `.docx` |

Files exceeding 10 MB or with disallowed types will be rejected with a `400 Bad Request` response.

### 4.5 ApiGateway � ocelot.json Route Summary

The gateway routes are defined in `src/ApiGateway/ocelot.json`. The complete routing table is:

| Method | Upstream (Gateway) Path | Auth Required | Downstream Service | Downstream Path |
|--------|------------------------|---------------|--------------------|-----------------|
| POST | `/gateway/auth/register` | No | IdentityService :7001 | `/api/auth/register` |
| POST | `/gateway/auth/login` | No | IdentityService :7001 | `/api/auth/login` |
| ANY | `/gateway/auth/{everything}` | JWT | IdentityService :7001 | (dynamic) |
| GET | `/gateway/policies` | JWT | PolicyService :7002 | `/api/policies` |
| ANY | `/gateway/policies/{everything}` | JWT | PolicyService :7002 | (dynamic) |
| GET, POST | `/gateway/policy-types` | JWT | PolicyService :7002 | `/api/policy-types` |
| ANY | `/gateway/policy-types/{everything}` | JWT | PolicyService :7002 | (dynamic) |
| GET, POST | `/gateway/claims` | JWT | ClaimsService :7003 | `/api/claims` |
| ANY | `/gateway/claims/{everything}` | JWT | ClaimsService :7003 | (dynamic) |
| ANY | `/gateway/admin/{everything}` | JWT | AdminService :7004 | (dynamic) |

Routes marked "No" for auth are publicly accessible. All other routes require a valid JWT Bearer token in the `Authorization` header.

---

## 5. Running the Backend (5 Projects)

The backend consists of five .NET 8 projects that must all be running simultaneously: ApiGateway, IdentityService, PolicyService, ClaimsService, and AdminService.

### 5.1 Option A � Visual Studio 2022 (Recommended)

This is the easiest method. Visual Studio launches all five projects at once.

**Step 1 � Open the solution**

Open `SmartSure_InsuranceApp.slnx` in Visual Studio 2022.

**Step 2 � Configure Multiple Startup Projects**

1. Right-click the solution node (top of Solution Explorer) ? **Properties**.
2. Select **Common Properties ? Startup Project**.
3. Choose **Multiple startup projects**.
4. Set the **Action** for each project as follows:

| Project | Action |
|---------|--------|
| ApiGateway | Start |
| IdentityService | Start |
| PolicyService | Start |
| ClaimsService | Start |
| AdminService | Start |

5. Click **OK**.

**Step 3 � Start the application**

Press **F5** (with debugging) or **Ctrl+F5** (without debugging).

Visual Studio will build all projects and launch five browser tabs � one for each service's Swagger UI.

### 5.2 Option B � .NET CLI (Five Terminals)

Open five separate terminal windows (PowerShell, Command Prompt, or Windows Terminal tabs). Run one command per terminal, all from the solution root:

**Terminal 1 � API Gateway**
```bash
dotnet run --project src/ApiGateway
```
Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7000
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Terminal 2 � Identity Service**
```bash
dotnet run --project src/IdentityService
```
Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
      Now listening on: http://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Terminal 3 � Policy Service**
```bash
dotnet run --project src/PolicyService
```
Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7002
      Now listening on: http://localhost:5002
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Terminal 4 � Claims Service**
```bash
dotnet run --project src/ClaimsService
```
Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7003
      Now listening on: http://localhost:5003
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Terminal 5 � Admin Service**
```bash
dotnet run --project src/AdminService
```
Expected output:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7004
      Now listening on: http://localhost:5004
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 5.3 Verify All Services Are Running

Once all five terminals show "Application started", open a browser and navigate to each Swagger UI to confirm the service is healthy:

| Service | HTTPS URL | HTTP URL |
|---------|-----------|----------|
| API Gateway | https://localhost:7000 | http://localhost:5000 |
| IdentityService | https://localhost:7001/swagger | http://localhost:5001/swagger |
| PolicyService | https://localhost:7002/swagger | http://localhost:5002/swagger |
| ClaimsService | https://localhost:7003/swagger | http://localhost:5003/swagger |
| AdminService | https://localhost:7004/swagger | http://localhost:5004/swagger |

Each Swagger page should load and display the available API endpoints for that service. If a page fails to load, check the corresponding terminal for error messages.

### 5.4 SSL Certificate Trust (First Run)

On first run, your browser may warn about an untrusted SSL certificate for `localhost`. This is expected for development. Click **Advanced ? Proceed to localhost** (Chrome) or **Accept the Risk and Continue** (Firefox) for each service URL.

Alternatively, trust the .NET development certificate once:

```bash
dotnet dev-certs https --trust
```

---

## 6. Running the Angular Frontend

The Angular 21 frontend communicates exclusively through the Ocelot API Gateway at `https://localhost:7000`. All backend services must be running before starting the frontend.

### 6.1 Install Node Dependencies

If you have not already done so, install the npm packages:

```bash
cd smartsure-ui
npm install
```

This reads `package.json` and installs all dependencies into `node_modules/`. The process takes 30�90 seconds on first run.

Expected final output:
```
added 1234 packages, and audited 1235 packages in 45s
found 0 vulnerabilities
```

### 6.2 Verify the Environment File

The Angular app uses an environment file to know where the API Gateway is. Open `smartsure-ui/src/environments/environment.ts` and confirm it reads:

```typescript
export const environment = {
  production: false,
  gatewayUrl: 'https://localhost:7000'
};
```

If the `gatewayUrl` is different, update it to `https://localhost:7000` before starting the app.

### 6.3 Start the Development Server

From the `smartsure-ui` directory:

```bash
ng serve
```

Or, if you do not have Angular CLI installed globally:

```bash
npx ng serve
```

Expected output:
```
Initial chunk files | Names         |  Raw size
main.js             | main          | 512.34 kB
polyfills.js        | polyfills     |  34.82 kB
styles.css          | styles        |   8.00 kB

Application bundle generation complete. [4.500 seconds]

Watch mode enabled. Watching for file changes...
  ?  Local:   http://localhost:4200/
  ?  press h + enter to show help
```

### 6.4 Open the Application

Navigate to:

```
http://localhost:4200
```

You will be redirected to the landing page at `http://localhost:4200/landing`.

### 6.5 Angular Modules Overview

The application is organized into the following Angular modules:

| Module | Location | Purpose |
|--------|----------|---------|
| `CoreModule` | `src/app/core/` | Services, guards, interceptors, models � imported once in AppModule |
| `SharedModule` | `src/app/shared/` | Reusable components and pipes shared across feature modules |
| `AuthModule` | `src/app/auth/` | Login and Register pages |
| `CustomerModule` | `src/app/customer/` | Customer dashboard, policy purchase, policy list, policy detail, document upload |
| `ClaimsModule` | `src/app/claims/` | Initiate claim wizard, claim tracking |
| `AdminModule` | `src/app/admin/` | Admin dashboard, claim review, policy management, user management |
| `ReportsModule` | `src/app/reports/` | Reports page with chart visualizations and CSV export |

### 6.6 Angular Pages Reference

| Page | Route | Module | Access |
|------|-------|--------|--------|
| Landing | `/landing` | AppModule | Public |
| Login | `/auth/login` | AuthModule | Public |
| Register | `/auth/register` | AuthModule | Public |
| Customer Dashboard | `/customer/dashboard` | CustomerModule | Authenticated |
| Buy Policy (3-step wizard) | `/customer/buy-policy` | CustomerModule | Authenticated |
| My Policies | `/customer/policies` | CustomerModule | Authenticated |
| Policy Details | `/customer/policies/:id` | CustomerModule | Authenticated |
| Upload Documents | `/customer/upload-documents` | CustomerModule | Authenticated |
| Initiate Claim (4-step wizard) | `/claims/initiate` | ClaimsModule | Authenticated |
| Claim Tracking | `/claims/tracking` | ClaimsModule | Authenticated |
| Admin Dashboard | `/admin/dashboard` | AdminModule | Admin role |
| Admin Claim Review | `/admin/claim-review` | AdminModule | Admin role |
| Admin Policy Management | `/admin/policy-management` | AdminModule | Admin role |
| User Management | `/admin/user-management` | AdminModule | Admin role |
| Reports | `/reports` | ReportsModule | Admin role |

### 6.7 JWT Interceptor

The `CoreModule` registers a JWT interceptor at `src/app/core/interceptors/jwt.interceptor.ts`. This interceptor automatically attaches the `Authorization: Bearer <token>` header to every outgoing HTTP request when a token is present in local storage. You do not need to manually add auth headers in any service call.

---

## 7. First Time Setup

Follow these steps in exact order the very first time you set up SmartSure on a new machine.

### Step 1 � Install Prerequisites

Install all tools listed in Section 1. Verify each with the commands in Section 1.4.

### Step 2 � Clone or Extract the Project

```bash
git clone <repository-url>
cd SmartSure_InsuranceApp
```

Or extract the ZIP and navigate to the folder.

### Step 3 � Restore .NET Tools

```bash
dotnet tool restore
```

### Step 4 � Update Connection Strings

Open each `appsettings.json` file and replace `YOUR_SERVER\SQLEXPRESS` with your actual SQL Server instance name. Files to update:

- `src/IdentityService/appsettings.json`
- `src/PolicyService/appsettings.json`
- `src/ClaimsService/appsettings.json`
- `src/AdminService/appsettings.json`

See Section 4.1 for the exact JSON structure.

### Step 5 � Run All Database Migrations

```bash
dotnet ef database update --project src/IdentityService
dotnet ef database update --project src/PolicyService
dotnet ef database update --project src/ClaimsService
dotnet ef database update --project src/AdminService
```

All four commands should end with `Done.`

### Step 6 � Verify Databases in SSMS

Open SSMS, connect to your instance, and confirm all four databases exist with their tables. Specifically verify that `SmartSureAppDb_Policy ? Tables ? PolicyTypes` contains 3 rows.

### Step 7 � Trust the Development SSL Certificate

```bash
dotnet dev-certs https --trust
```

Click **Yes** when prompted to trust the certificate.

### Step 8 � Install Angular Dependencies

```bash
cd smartsure-ui
npm install
cd ..
```

### Step 9 � Start All Backend Services

Open `SmartSure_InsuranceApp.slnx` in Visual Studio 2022, configure Multiple Startup Projects (all five set to Start), and press **F5**.

Or use five terminals as described in Section 5.2.

### Step 10 � Start the Angular Frontend

```bash
cd smartsure-ui
ng serve
```

### Step 11 � Open the Application

Navigate to `http://localhost:4200` in your browser.

### Step 12 � Register Your First User

1. Click **Get Started** or navigate to `http://localhost:4200/auth/register`.
2. Fill in the registration form:
   - **Full Name** � your name
   - **Email** � a valid email address (used as login username)
   - **Password** � must meet the password policy
   - **Confirm Password** � must match Password
3. Click **Register**.
4. On success, you will be redirected to the login page.

### Step 13 � Log In

1. Navigate to `http://localhost:4200/auth/login`.
2. Enter your email and password.
3. Click **Login**.
4. On success, you will be redirected to the Customer Dashboard.

The JWT token is stored in the browser's local storage and automatically attached to all subsequent API requests by the JWT interceptor.

---

## 8. Complete User Flows

### 8.1 Customer Registration Flow

**Goal:** Create a new customer account.

1. Navigate to `http://localhost:4200/auth/register`.
2. Complete the registration form:
   - **Full Name** � e.g., `Jane Smith`
   - **Email** � e.g., `jane.smith@example.com`
   - **Password** � e.g., `Password123!`
   - **Confirm Password** � `Password123!`
3. Click **Register**.
4. The Angular app sends:
   ```
   POST https://localhost:7000/gateway/auth/register
   Body: { "fullName": "Jane Smith", "email": "jane.smith@example.com", "password": "Password123!" }
   ```
5. The gateway forwards to `POST https://localhost:7001/api/auth/register`.
6. IdentityService hashes the password and inserts a row into the `Users` table in `SmartSureAppDb_Identity`.
7. On success (`201 Created`), the app redirects to `/auth/login`.

---

### 8.2 Customer Login Flow

**Goal:** Authenticate and receive a JWT token.

1. Navigate to `http://localhost:4200/auth/login`.
2. Enter email and password.
3. Click **Login**.
4. The Angular app sends:
   ```
   POST https://localhost:7000/gateway/auth/login
   Body: { "email": "jane.smith@example.com", "password": "Password123!" }
   ```
5. The gateway forwards to `POST https://localhost:7001/api/auth/login`.
6. IdentityService validates credentials, generates a JWT signed with `SmartSure_SuperSecret_JWT_Key_2024!@#$%`, valid for 8 hours.
7. Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiry": "2026-04-06T17:00:00Z"
   }
   ```
8. The Angular app stores the token in `localStorage` under the key `token`.
9. The JWT interceptor attaches `Authorization: Bearer <token>` to all subsequent requests.
10. The app redirects to `/customer/dashboard`.

---

### 8.3 Buy Policy � 3-Step Wizard

**Goal:** Purchase an insurance policy.

Navigate to `/customer/buy-policy` or click **Buy Policy** on the Customer Dashboard.

**Step 1 � Select Policy Type**

The wizard calls:
```
GET https://localhost:7000/gateway/policy-types
Authorization: Bearer <token>
```
This returns the three seeded policy types:
```json
[
  { "id": 1, "name": "Life Insurance", "description": "Coverage for life events", "baseRate": 0.05 },
  { "id": 2, "name": "Health Insurance", "description": "Medical expense coverage", "baseRate": 0.08 },
  { "id": 3, "name": "Vehicle Insurance", "description": "Motor vehicle coverage", "baseRate": 0.06 }
]
```
Select a policy type and click **Next**.

**Step 2 � Enter Coverage Details**

Fill in:
- **Coverage Amount** � the insured sum (e.g., `100000`)
- **Start Date** � policy effective date
- **End Date** � policy expiry date

The premium is calculated based on the selected policy type's `BaseRate` and the coverage amount. Click **Next**.

**Step 3 � Review and Confirm**

Review the policy summary:
- Policy Type
- Coverage Amount
- Premium Amount
- Policy Period

Click **Confirm Purchase**. The app sends:
```
POST https://localhost:7000/gateway/policies
Authorization: Bearer <token>
Body: {
  "policyTypeId": 1,
  "coverageAmount": 100000,
  "startDate": "2026-04-06",
  "endDate": "2027-04-06"
}
```
On success (`201 Created`), the app redirects to **My Policies**.

---

### 8.4 View My Policies

Navigate to `/customer/policies` or click **My Policies** on the dashboard.

The app calls:
```
GET https://localhost:7000/gateway/policies
Authorization: Bearer <token>
```
Returns a list of all policies belonging to the logged-in user. Each policy card shows:
- Policy Type name
- Coverage Amount
- Premium Amount
- Status (Active / Expired / Cancelled)
- Start and End dates

Click any policy to view its full details at `/customer/policies/:id`.

---

### 8.5 Upload Documents

Navigate to `/customer/upload-documents` or click **Upload Documents** from a policy detail page.

1. Select a file using the file picker. Allowed types: PDF, JPG, PNG, DOC, DOCX. Maximum size: 10 MB.
2. Select the associated policy from the dropdown.
3. Click **Upload**.

The app sends a `multipart/form-data` POST request:
```
POST https://localhost:7000/gateway/claims/{claimId}/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: file + policyId
```
On success, the document is stored and linked to the claim.

---

### 8.6 Initiate Claim � 4-Step Wizard

**Goal:** Submit an insurance claim.

Navigate to `/claims/initiate` or click **File a Claim** on the dashboard.

**Step 1 � Select Policy**

Choose the policy against which you are filing the claim from a dropdown of your active policies.

**Step 2 � Describe the Incident**

Fill in:
- **Incident Date** � when the incident occurred
- **Description** � detailed description of the incident (required)
- **Claim Amount** � the amount being claimed

**Step 3 � Upload Supporting Documents**

Attach one or more supporting documents (PDF, JPG, PNG, DOC, DOCX, max 10 MB each). These are uploaded alongside the claim.

**Step 4 � Review and Submit**

Review all entered information. Click **Submit Claim**.

The app sends:
```
POST https://localhost:7000/gateway/claims
Authorization: Bearer <token>
Body: {
  "policyId": 1,
  "incidentDate": "2026-04-01",
  "description": "Vehicle damaged in accident",
  "claimAmount": 5000
}
```
On success (`201 Created`), the claim is created with status `Pending` and the app redirects to **Claim Tracking**.

---

### 8.7 Claim Tracking

Navigate to `/claims/tracking` or click **Track Claims** on the dashboard.

The app calls:
```
GET https://localhost:7000/gateway/claims
Authorization: Bearer <token>
```
Returns all claims for the logged-in user. Each claim shows:
- Claim ID
- Associated Policy
- Incident Date
- Claim Amount
- Status: `Pending` | `Under Review` | `Approved` | `Rejected`
- Submission Date

---

### 8.8 Admin � Review Claims

Admin users navigate to `/admin/claim-review`.

The app calls:
```
GET https://localhost:7000/gateway/admin/claims
Authorization: Bearer <token>
```
Returns all claims across all users. The admin can:
- View claim details and attached documents
- Change claim status to `Approved` or `Rejected`
- Add review notes

To approve a claim:
```
PUT https://localhost:7000/gateway/admin/claims/{id}/approve
Authorization: Bearer <token>
```

To reject a claim:
```
PUT https://localhost:7000/gateway/admin/claims/{id}/reject
Authorization: Bearer <token>
```

---

### 8.9 Admin � Policy Management

Navigate to `/admin/policy-management`.

Admins can view all policies across all users, filter by status, and manage policy types. Policy type management calls:
```
GET https://localhost:7000/gateway/policy-types
POST https://localhost:7000/gateway/policy-types
PUT https://localhost:7000/gateway/policy-types/{id}
DELETE https://localhost:7000/gateway/policy-types/{id}
```

---

### 8.10 Admin � User Management

Navigate to `/admin/user-management`.

Admins can view all registered users. The page calls:
```
GET https://localhost:7000/gateway/admin/users
Authorization: Bearer <token>
```

---

### 8.11 Admin � Reports

Navigate to `/reports`.

The Reports page aggregates data from all microservices. The AdminService makes internal calls (using `X-Internal-Key: SmartSure_Internal_Key_XYZ_2024`) to:

| Internal Call | Returns |
|--------------|---------|
| `GET https://localhost:7001/api/internal/users/count` | Total registered users |
| `GET https://localhost:7002/api/internal/policies/count` | Total active policies |
| `GET https://localhost:7003/api/internal/claims/count` | Total claims submitted |
| `GET https://localhost:7003/api/internal/claims/pending/count` | Claims pending review |

The Reports page displays:
- Summary statistics cards (total users, policies, claims, pending claims)
- Chart visualizations of claims by status
- CSV export button to download the full report

---

## 9. Running the Tests

SmartSure includes two test suites: NUnit tests for the .NET backend (49 total) and Jasmine/Karma tests for the Angular frontend (14 total).

### 9.1 Backend NUnit Tests

#### Test Projects Summary

| Project | Test Count | What Is Tested |
|---------|-----------|----------------|
| `IdentityService.Tests` | 13 | User registration, login, password hashing, JWT generation, duplicate email handling, invalid credentials |
| `IdentityService.Tests` | 19 | Register, login, duplicate email, invalid password, JWT generation, OTP flow, user repository CRUD, password hashing |
| `PolicyService.Tests` | 22 | Policy creation, retrieval, update, cancellation, premium calculation, payment processing, policy type CRUD, lifecycle transition guards |
| `ClaimsService.Tests` | 17 | Claim submission, status transitions, transition guard (invalid transitions rejected), document attachment, claim retrieval by user, claim retrieval by admin, ownership check |
| `AdminService.Tests` | 5 | Admin dashboard aggregation, report generation, internal API key validation, unauthorized access rejection |

**Total backend tests: 63 (all passing)**

#### Run All Backend Tests

From the solution root:

```bash
dotnet test --no-build
```

> Use `--no-build` if services are currently running to avoid file-lock errors.

Expected output:
```
Passed!  - Failed: 0, Passed:  5, Skipped: 0, Total:  5, Duration: 456 ms - AdminService.Tests.dll (net8.0)
Passed!  - Failed: 0, Passed: 17, Skipped: 0, Total: 17, Duration: 351 ms - ClaimsService.Tests.dll (net8.0)
Passed!  - Failed: 0, Passed: 22, Skipped: 0, Total: 22, Duration: 410 ms - PolicyService.Tests.dll (net8.0)
Passed!  - Failed: 0, Passed: 19, Skipped: 0, Total: 19, Duration: 1 s   - IdentityService.Tests.dll (net8.0)
```

#### Run Individual Test Projects

```bash
# Identity service tests only
dotnet test tests/IdentityService.Tests

# Policy service tests only
dotnet test tests/PolicyService.Tests

# Claims service tests only
dotnet test tests/ClaimsService.Tests

# Admin service tests only
dotnet test tests/AdminService.Tests
```

#### Run Tests with Verbose Output

```bash
dotnet test --logger "console;verbosity=detailed"
```

This prints each test name and its pass/fail status individually.

#### Run Tests in Visual Studio

1. Open **Test Explorer**: `Test` menu ? **Test Explorer** (or `Ctrl+E, T`).
2. Click **Run All Tests in View** (the play button at the top of Test Explorer).
3. Tests are grouped by project. Expand each project to see individual test names.
4. Green checkmarks = passed. Red X = failed. Click a failed test to see the error message and stack trace.

### 9.2 Frontend Vitest Tests

The frontend uses **Vitest** (not Karma/Jasmine) for unit testing, configured via `vitest.config.ts` in the `smartsure-ui` folder.

#### Test Files Summary

| Spec File | Test Count | What Is Tested |
|-----------|-----------|----------------|
| `auth.service.spec.ts` | 18 | login(), register(), logout(), getToken(), getUserId(), getRole(), isLoggedIn(), token storage/retrieval, error handling |
| `jwt.interceptor.spec.ts` | 9 | Token attachment to requests, requests without token pass through, Authorization header format |
| `auth.guard.spec.ts` | 16 | `authGuard` (unauthenticated redirect), `customerGuard` (role check), `adminGuard` (admin-only), all 3 guards with valid tokens |
| `login.component.spec.ts` | 16 | Component creation, form validation, successful login redirect, failed login error display, loading state, form field binding |
| `app.spec.ts` | 2 | Root app component creation, router outlet presence |

**Total frontend tests: 61 (all passing)**

#### Run All Frontend Tests (Single Run)

```bash
cd smartsure-ui
npx vitest run
```

Expected output:
```
 ✓ src/app/core/services/auth.service.spec.ts (18)
 ✓ src/app/core/interceptors/jwt.interceptor.spec.ts (9)
 ✓ src/app/core/guards/auth.guard.spec.ts (16)
 ✓ src/app/auth/login/login.component.spec.ts (16)
 ✓ src/app/app.spec.ts (2)

 Test Files  5 passed (5)
      Tests  61 passed (61)
```

#### Run Tests in Watch Mode (Development)

```bash
cd smartsure-ui
ng test
```

Karma opens a browser window and re-runs tests automatically whenever a file changes. Press `Ctrl+C` to stop.

#### Run a Specific Spec File

```bash
cd smartsure-ui
ng test --include="**/auth.service.spec.ts"
```

#### View Test Coverage

```bash
cd smartsure-ui
ng test --watch=false --code-coverage
```

Coverage report is generated in `smartsure-ui/coverage/`. Open `coverage/index.html` in a browser to view the detailed coverage report.

---

## 10. Swagger API Testing

Each microservice exposes a Swagger UI for interactive API testing. This is useful for testing endpoints directly without the Angular frontend.

### 10.1 Swagger URLs

| Service | Swagger URL |
|---------|------------|
| IdentityService | https://localhost:7001/swagger |
| PolicyService | https://localhost:7002/swagger |
| ClaimsService | https://localhost:7003/swagger |
| AdminService | https://localhost:7004/swagger |

> The API Gateway does not expose a Swagger UI. Test individual services directly via their Swagger pages, or test gateway routes using a tool like Postman or curl.

### 10.2 Testing Authentication (IdentityService Swagger)

**Step 1 � Register a user**

1. Open https://localhost:7001/swagger.
2. Expand `POST /api/auth/register`.
3. Click **Try it out**.
4. Enter the request body:
   ```json
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "Password123!"
   }
   ```
5. Click **Execute**.
6. Expected response: `201 Created` with the new user's ID.

**Step 2 � Login and get a JWT**

1. Expand `POST /api/auth/login`.
2. Click **Try it out**.
3. Enter:
   ```json
   {
     "email": "test@example.com",
     "password": "Password123!"
   }
   ```
4. Click **Execute**.
5. Expected response: `200 OK` with a JSON body containing `"token": "eyJ..."`.
6. Copy the token value (without the surrounding quotes).

**Step 3 � Authorize Swagger**

1. Click the **Authorize** button (padlock icon) at the top right of the Swagger page.
2. In the **Value** field, enter: `Bearer eyJ...` (paste your token after "Bearer ").
3. Click **Authorize**, then **Close**.

All subsequent requests from this Swagger session will include the JWT.

### 10.3 Testing Policy Endpoints (PolicyService Swagger)

1. Open https://localhost:7002/swagger.
2. Authorize with your JWT (same steps as above).
3. Test `GET /api/policy-types` � returns the 3 seeded policy types.
4. Test `POST /api/policies` to create a policy:
   ```json
   {
     "policyTypeId": 1,
     "coverageAmount": 50000,
     "startDate": "2026-04-06",
     "endDate": "2027-04-06"
   }
   ```
5. Expected response: `201 Created` with the new policy object including its generated ID.
6. Test `GET /api/policies` � returns all policies for the authenticated user.
7. Test `GET /api/policies/{id}` � returns a single policy by ID.

### 10.4 Testing Claims Endpoints (ClaimsService Swagger)

1. Open https://localhost:7003/swagger.
2. Authorize with your JWT.
3. Test `POST /api/claims` to submit a claim:
   ```json
   {
     "policyId": 1,
     "incidentDate": "2026-04-01",
     "description": "Accident on highway",
     "claimAmount": 3000
   }
   ```
4. Expected response: `201 Created` with the new claim object and `"status": "Pending"`.
5. Test `GET /api/claims` � returns all claims for the authenticated user.
6. Test `GET /api/claims/{id}` � returns a single claim by ID.

### 10.5 Testing Admin Endpoints (AdminService Swagger)

1. Open https://localhost:7004/swagger.
2. Authorize with your JWT.
3. Test `GET /api/admin/dashboard` � returns aggregated statistics (requires all other services to be running, as AdminService makes internal calls).
4. Test `GET /api/admin/claims` � returns all claims across all users.
5. Test `PUT /api/admin/claims/{id}/approve` � approves a claim.
6. Test `PUT /api/admin/claims/{id}/reject` � rejects a claim.

### 10.6 Testing Internal Endpoints

The internal endpoints are protected by the `X-Internal-Key` header, not JWT. To test them in Swagger:

1. Open the Swagger page for the target service (e.g., https://localhost:7001/swagger).
2. Click **Authorize**.
3. In the `X-Internal-Key` field (if shown), enter: `SmartSure_Internal_Key_XYZ_2024`.
4. Alternatively, use curl:

```bash
# Get total user count
curl -k -H "X-Internal-Key: SmartSure_Internal_Key_XYZ_2024" https://localhost:7001/api/internal/users/count

# Get total policy count
curl -k -H "X-Internal-Key: SmartSure_Internal_Key_XYZ_2024" https://localhost:7002/api/internal/policies/count

# Get total claims count
curl -k -H "X-Internal-Key: SmartSure_Internal_Key_XYZ_2024" https://localhost:7003/api/internal/claims/count

# Get pending claims count
curl -k -H "X-Internal-Key: SmartSure_Internal_Key_XYZ_2024" https://localhost:7003/api/internal/claims/pending/count
```

Expected responses are plain integers, e.g., `5`.

### 10.7 Testing via the API Gateway

To test routes through the Ocelot gateway (as the Angular app does), use curl or Postman:

```bash
# Register (public � no token needed)
curl -k -X POST https://localhost:7000/gateway/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","password":"Password123!"}'

# Login (public � no token needed)
curl -k -X POST https://localhost:7000/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get policies (JWT required)
curl -k https://localhost:7000/gateway/policies \
  -H "Authorization: Bearer <your-token>"

# Get policy types (JWT required)
curl -k https://localhost:7000/gateway/policy-types \
  -H "Authorization: Bearer <your-token>"

# Get claims (JWT required)
curl -k https://localhost:7000/gateway/claims \
  -H "Authorization: Bearer <your-token>"
```

---

## 11. Troubleshooting

### 11.1 Database Connection Errors

**Symptom:**
```
A network-related or instance-specific error occurred while establishing a connection to SQL Server.
Microsoft.Data.SqlClient.SqlException: Cannot open database "SmartSureAppDb_Identity" requested by the login.
```

**Causes and Fixes:**

1. **SQL Server is not running.**
   Open **Services** (Win+R ? `services.msc`) and ensure `SQL Server (SQLEXPRESS)` or your named instance is in the **Running** state. Start it if stopped.

2. **Wrong instance name in connection string.**
   Open SSMS and note the exact server name shown in the connection dialog (e.g., `LAPTOP-6AC40P6B\SQLEXPRESS`). Update all four `appsettings.json` files with this exact name.

3. **Migrations not run.**
   Run `dotnet ef database update --project src/IdentityService` (and the same for the other three services). The database is created by the migration, not manually.

4. **Windows Authentication not configured.**
   Ensure your Windows user account has access to the SQL Server instance. In SSMS, go to **Security ? Logins** and confirm your account is listed with appropriate permissions.

---

### 11.2 401 Unauthorized on All API Calls

**Symptom:** Every authenticated request returns `401 Unauthorized`, even immediately after login.

**Causes and Fixes:**

1. **JWT settings mismatch between services.**
   Open every `appsettings.json` (IdentityService, PolicyService, ClaimsService, AdminService, ApiGateway) and confirm the `Key`, `Issuer`, and `Audience` are exactly:
   - Key: `SmartSure_SuperSecret_JWT_Key_2024!@#$%`
   - Issuer: `SmartSureApp`
   - Audience: `SmartSureClients`
   Even a single extra space or character difference will cause validation to fail.

2. **Token not being attached.**
   Open browser DevTools ? Network tab. Check that requests to `https://localhost:7000/gateway/...` include the header `Authorization: Bearer eyJ...`. If not, check `jwt.interceptor.ts` and ensure it is registered in `CoreModule`.

3. **Token expired.**
   Tokens expire after 8 hours. Log out and log back in to get a fresh token.

4. **Wrong gateway URL in Angular environment.**
   Confirm `smartsure-ui/src/environments/environment.ts` has `gatewayUrl: 'https://localhost:7000'`.

---

### 11.3 Migrations Fail

**Symptom:**
```
No migrations configuration type was found in the assembly 'IdentityService'.
```
or
```
Unable to create an object of type 'IdentityDbContext'.
```

**Causes and Fixes:**

1. **Running from wrong directory.**
   Always run `dotnet ef` commands from the solution root with the `--project` flag:
   ```bash
   dotnet ef database update --project src/IdentityService
   ```

2. **EF Core tools not installed.**
   Run `dotnet tool restore` from the solution root to install the tools from `dotnet-tools.json`.

3. **Connection string not updated.**
   The migration command needs a valid connection string to create the database. Update `appsettings.json` before running migrations.

4. **Build errors in the project.**
   Run `dotnet build src/IdentityService` first. Fix any compilation errors before running migrations.

---

### 11.4 Angular `ng serve` Fails

**Symptom:**
```
An unhandled exception occurred: Cannot find module '@angular/compiler-cli'
```
or
```
Error: Cannot find module 'typescript'
```

**Causes and Fixes:**

1. **`node_modules` not installed or corrupted.**
   ```bash
   cd smartsure-ui
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Wrong Node.js version.**
   Angular 21 requires Node.js v24+. Check with `node --version`. If lower, download and install Node.js v24 from https://nodejs.org/.

3. **Angular CLI version mismatch.**
   Use the local CLI instead of the global one:
   ```bash
   npx ng serve
   ```

---

### 11.5 CORS Errors in Browser

**Symptom:**
```
Access to XMLHttpRequest at 'https://localhost:7000/gateway/...' from origin 'http://localhost:4200'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Causes and Fixes:**

1. **Backend services not running.**
   Ensure all five backend services are running. CORS errors can appear when the gateway cannot reach a downstream service.

2. **CORS not configured for Angular origin.**
   Each service's `Program.cs` should include a CORS policy allowing `http://localhost:4200`. Verify this is present and that the gateway also allows the Angular origin.

3. **Requests going directly to services instead of the gateway.**
   All Angular HTTP calls must go to `https://localhost:7000/gateway/...`. Check `environment.ts` and all service files in `src/app/core/services/`.

---

### 11.6 Port Already in Use

**Symptom:**
```
Failed to bind to address https://localhost:7001: address already in use.
```

**Fix:**

Find and kill the process occupying the port:

```bash
# Find the process using port 7001
netstat -ano | findstr :7001

# Kill it (replace 12345 with the actual PID from the output above)
taskkill /PID 12345 /F
```

Or change the port in `src/IdentityService/Properties/launchSettings.json` and update the corresponding downstream URL in `src/ApiGateway/ocelot.json`.

---

### 11.7 PolicyTypes Table Is Empty

**Symptom:** The "Buy Policy" wizard shows no policy types in the dropdown.

**Fix:**

The seed data is applied by the `20260406090112_SeedPolicyTypes` migration. If this migration was not applied:

```bash
dotnet ef database update --project src/PolicyService
```

Verify in SSMS:
```sql
USE SmartSureAppDb_Policy;
SELECT * FROM PolicyTypes;
-- Must return 3 rows
```

If the table is still empty after running migrations, check that the migration file `src/PolicyService/Migrations/20260406090112_SeedPolicyTypes.cs` exists and contains the seed data `INSERT` statements.

---

### 11.8 AdminService Dashboard Returns Zeros or Errors

**Symptom:** The Admin Dashboard shows 0 for all statistics, or the Reports page fails to load.

**Cause:** AdminService makes internal HTTP calls to IdentityService, PolicyService, and ClaimsService. If any of those services are not running, the internal calls fail.

**Fix:**

1. Ensure all four microservices (IdentityService, PolicyService, ClaimsService, AdminService) are running.
2. Confirm the `InternalApiKey` in all `appsettings.json` files is `SmartSure_Internal_Key_XYZ_2024`.
3. Test the internal endpoints manually with curl (see Section 10.6).

---

### 11.9 File Upload Fails

**Symptom:** Document upload returns `400 Bad Request` or `413 Request Entity Too Large`.

**Causes and Fixes:**

1. **File too large.** Maximum allowed size is 10 MB. Reduce the file size or use a different file.
2. **Unsupported file type.** Only PDF, JPG, PNG, DOC, and DOCX are accepted. Rename or convert the file.
3. **IIS/Kestrel request size limit.** If running behind IIS, ensure `maxAllowedContentLength` is set to at least 10 MB (10485760 bytes) in `web.config`.

---

## 12. Ports Quick Reference

### 12.1 Service Ports

| Service | HTTPS Port | HTTP Port | Swagger UI |
|---------|-----------|----------|------------|
| Angular Frontend | 4200 | � | http://localhost:4200 |
| API Gateway (Ocelot) | 7000 | 5000 | https://localhost:7000 |
| IdentityService | 7001 | 5001 | https://localhost:7001/swagger |
| PolicyService | 7002 | 5002 | https://localhost:7002/swagger |
| ClaimsService | 7003 | 5003 | https://localhost:7003/swagger |
| AdminService | 7004 | 5004 | https://localhost:7004/swagger |

### 12.2 Key URLs at a Glance

| Purpose | URL |
|---------|-----|
| Application (Angular) | http://localhost:4200 |
| Landing page | http://localhost:4200/landing |
| Login | http://localhost:4200/auth/login |
| Register | http://localhost:4200/auth/register |
| Customer Dashboard | http://localhost:4200/customer/dashboard |
| Admin Dashboard | http://localhost:4200/admin/dashboard |
| Reports | http://localhost:4200/reports |
| Gateway base URL | https://localhost:7000 |
| Register (via gateway) | POST https://localhost:7000/gateway/auth/register |
| Login (via gateway) | POST https://localhost:7000/gateway/auth/login |
| Policies (via gateway) | https://localhost:7000/gateway/policies |
| Policy Types (via gateway) | https://localhost:7000/gateway/policy-types |
| Claims (via gateway) | https://localhost:7000/gateway/claims |
| Admin routes (via gateway) | https://localhost:7000/gateway/admin/... |

### 12.3 Internal Service-to-Service URLs

These URLs are used only by AdminService when making internal calls. They bypass the gateway and use the `X-Internal-Key` header:

| Purpose | URL |
|---------|-----|
| Total user count | https://localhost:7001/api/internal/users/count |
| Total policy count | https://localhost:7002/api/internal/policies/count |
| Total claims count | https://localhost:7003/api/internal/claims/count |
| Pending claims count | https://localhost:7003/api/internal/claims/pending/count |

### 12.4 Configuration Values Summary

| Setting | Value |
|---------|-------|
| JWT Key | `SmartSure_SuperSecret_JWT_Key_2024!@#$%` |
| JWT Issuer | `SmartSureApp` |
| JWT Audience | `SmartSureClients` |
| JWT Expiry | 8 hours |
| Internal API Key | `SmartSure_Internal_Key_XYZ_2024` |
| Internal API Header | `X-Internal-Key` |
| Max Upload Size | 10 MB |
| Allowed Upload Types | PDF, JPG, PNG, DOC, DOCX |

---

## 13. Project Folder Structure

```
SmartSure_InsuranceApp/
+-- SmartSure_InsuranceApp.slnx          # Visual Studio solution file
+-- README.md                            # This file
+-- dotnet-tools.json                    # EF Core CLI tool manifest
�
+-- src/
�   �
�   +-- ApiGateway/                      # Ocelot API Gateway � port 7000 (HTTPS) / 5000 (HTTP)
�   �   +-- Properties/
�   �   �   +-- launchSettings.json      # Port configuration (7000/5000)
�   �   +-- ocelot.json                  # All route definitions (upstream ? downstream mappings)
�   �   +-- Program.cs                   # Gateway startup: Ocelot middleware, JWT validation, CORS
�   �   +-- appsettings.json             # JWT settings (must match all services)
�   �   +-- ApiGateway.csproj
�   �
�   +-- IdentityService/                 # Authentication microservice � port 7001 (HTTPS) / 5001 (HTTP)
�   �   +-- Controllers/
�   �   �   +-- AuthController.cs        # POST /api/auth/register, POST /api/auth/login
�   �   �   +-- InternalController.cs    # GET /api/internal/users/count (X-Internal-Key protected)
�   �   +-- Data/
�   �   �   +-- IdentityDbContext.cs     # EF Core DbContext for SmartSureAppDb_Identity
�   �   +-- DTOs/
�   �   �   +-- AuthDtos.cs              # RegisterDto, LoginDto, AuthResponseDto
�   �   +-- Migrations/
�   �   �   +-- 20260405170330_InitialCreate.cs
�   �   +-- Models/
�   �   �   +-- User.cs                  # User entity: Id, FullName, Email, PasswordHash, CreatedAt
�   �   +-- Repositories/
�   �   �   +-- IUserRepository.cs
�   �   �   +-- UserRepository.cs        # GetByEmail, Add, GetCount
�   �   +-- Services/
�   �   �   +-- IAuthService.cs
�   �   �   +-- AuthService.cs           # Register, Login, GenerateJwt
�   �   +-- Properties/
�   �   �   +-- launchSettings.json
�   �   +-- Program.cs                   # Service startup: EF Core, Identity, JWT, Swagger
�   �   +-- appsettings.json             # ConnectionStrings, JwtSettings, InternalApiKey
�   �   +-- IdentityService.csproj
�   �
�   +-- PolicyService/                   # Policy microservice � port 7002 (HTTPS) / 5002 (HTTP)
�   �   +-- Controllers/
�   �   �   +-- PoliciesController.cs    # GET/POST/PUT/DELETE /api/policies
�   �   �   +-- PolicyTypesController.cs # GET/POST/PUT/DELETE /api/policy-types
�   �   �   +-- InternalController.cs    # GET /api/internal/policies/count (X-Internal-Key protected)
�   �   +-- Data/
�   �   �   +-- PolicyDbContext.cs       # EF Core DbContext for SmartSureAppDb_Policy (includes seed)
�   �   +-- DTOs/
�   �   �   +-- PolicyDtos.cs            # CreatePolicyDto, PolicyResponseDto, PolicyTypeDto, etc.
�   �   +-- Migrations/
�   �   �   +-- 20260405170954_InitialCreate.cs
�   �   �   +-- 20260406045954_AddDecimalPrecision.cs
�   �   �   +-- 20260406063612_ExplicitForeignKeys.cs
�   �   �   +-- 20260406072825_AddPremiumsNavigation.cs
�   �   �   +-- 20260406090112_SeedPolicyTypes.cs    # Inserts 3 default policy types
�   �   +-- Models/
�   �   �   +-- Policy.cs                # Policy entity: Id, UserId, PolicyTypeId, CoverageAmount, Status, Dates
�   �   �   +-- PolicyType.cs            # PolicyType entity: Id, Name, Description, BaseRate
�   �   �   +-- Premium.cs               # Premium entity: Id, PolicyId, Amount, DueDate, PaidDate
�   �   �   +-- Payment.cs               # Payment entity: Id, PremiumId, Amount, PaidAt, Method
�   �   +-- Repositories/
�   �   �   +-- IPolicyRepository.cs
�   �   �   +-- PolicyRepository.cs
�   �   �   +-- IPolicyTypeRepository.cs
�   �   �   +-- PolicyTypeRepository.cs
�   �   �   +-- IPremiumRepository.cs
�   �   �   +-- PremiumRepository.cs
�   �   �   +-- IPaymentRepository.cs
�   �   �   +-- PaymentRepository.cs
�   �   +-- Services/
�   �   �   +-- IPolicyService.cs
�   �   �   +-- PolicyService.cs         # CreatePolicy, GetPolicies, GetById, Cancel, CalculatePremium
�   �   +-- Properties/
�   �   �   +-- launchSettings.json
�   �   +-- Program.cs
�   �   +-- appsettings.json
�   �   +-- PolicyService.csproj
�   �
�   +-- ClaimsService/                   # Claims microservice � port 7003 (HTTPS) / 5003 (HTTP)
�   �   +-- Controllers/
�   �   �   +-- ClaimsController.cs      # GET/POST /api/claims, GET/PUT /api/claims/{id}
�   �   �   +-- InternalController.cs    # GET /api/internal/claims/count, /pending/count
�   �   +-- Data/
�   �   �   +-- ClaimsDbContext.cs       # EF Core DbContext for SmartSureAppDb_Claims
�   �   +-- DTOs/
�   �   �   +-- ClaimDtos.cs             # CreateClaimDto, ClaimResponseDto, ClaimDocumentDto
�   �   +-- Migrations/
�   �   �   +-- 20260405172618_InitialCreate.cs
�   �   �   +-- 20260406050019_AddDecimalPrecision.cs
�   �   �   +-- 20260406063412_ExplicitForeignKeys.cs
�   �   +-- Models/
�   �   �   +-- Claim.cs                 # Claim entity: Id, UserId, PolicyId, Description, Amount, Status, Dates
�   �   �   +-- ClaimDocument.cs         # ClaimDocument entity: Id, ClaimId, FileName, FilePath, UploadedAt
�   �   +-- Repositories/
�   �   �   +-- IClaimRepository.cs
�   �   �   +-- ClaimRepository.cs       # GetByUser, GetAll, GetById, Add, UpdateStatus, GetCount, GetPendingCount
�   �   +-- Services/
�   �   �   +-- IClaimService.cs
�   �   �   +-- ClaimService.cs          # SubmitClaim, GetClaims, GetById, UpdateStatus, AttachDocument
�   �   +-- Properties/
�   �   �   +-- launchSettings.json
�   �   +-- Program.cs
�   �   +-- appsettings.json
�   �   +-- ClaimsService.csproj
�   �
�   +-- AdminService/                    # Admin microservice � port 7004 (HTTPS) / 5004 (HTTP)
�       +-- Controllers/
�       �   +-- AdminController.cs       # Unified controller: dashboard, claims, policies, users, reports
�       +-- Data/
�       �   +-- AdminDbContext.cs        # EF Core DbContext for SmartSureAppDb_Admin
�       +-- DTOs/
�       �   +-- AdminDtos.cs             # DashboardDto, ReportDto, ClaimReviewDto
�       +-- Migrations/
�       �   +-- 20260405172734_InitialCreate.cs
�       +-- Models/
�       �   +-- Report.cs                # Report entity: Id, GeneratedAt, ReportData, GeneratedBy
�       +-- Repositories/
�       �   +-- IReportRepository.cs
�       �   +-- ReportRepository.cs
�       +-- Services/
�       �   +-- IAdminService.cs
�       �   +-- AdminService.cs          # GetDashboard (calls internal APIs), GenerateReport, ReviewClaim
�       +-- Properties/
�       �   +-- launchSettings.json
�       +-- Program.cs
�       +-- appsettings.json
�       +-- AdminService.csproj
�
+-- tests/
�   +-- IdentityService.Tests/           # 19 NUnit tests
�   �   +-- AuthServiceTests.cs          # Register, login, duplicate email, invalid password, JWT generation, OTP flow
�   �   +-- UserRepositoryTests.cs       # GetByEmail, Add, GetCount
�   �   +-- IdentityService.Tests.csproj
�   �
�   +-- PolicyService.Tests/             # 22 NUnit tests
�   �   +-- PolicyServiceTests.cs        # Create, Get, Cancel, premium calculation, lifecycle transition guards
�   �   +-- PolicyTypeTests.cs           # CRUD for policy types
�   �   +-- PaymentTests.cs              # Payment processing
�   �   +-- PolicyService.Tests.csproj
�   �
�   +-- ClaimsService.Tests/             # 17 NUnit tests
�   �   +-- ClaimServiceTests.cs         # Submit, retrieve, status transitions, transition guards, ownership check
�   �   +-- ClaimDocumentTests.cs        # Document attachment and retrieval
�   �   +-- ClaimsService.Tests.csproj
�   �
�   +-- AdminService.Tests/              # 5 NUnit tests
�       +-- AdminServiceTests.cs         # Dashboard aggregation, report generation
�       +-- SecurityTests.cs             # Internal key validation, unauthorized access
�       +-- AdminService.Tests.csproj
�
+-- smartsure-ui/                        # Angular 21 frontend � port 4200
    +-- src/
    �   +-- app/
    �   �   +-- app.ts                   # Root component
    �   �   +-- app.html                 # Root template
    �   �   +-- app.routes.ts            # Top-level route definitions
    �   �   +-- app.config.ts            # App configuration (providers, interceptors)
    �   �   +-- app.scss                 # Root styles
    �   �   �
    �   �   +-- core/                    # CoreModule � singleton services and guards
    �   �   �   +-- core-module.ts
    �   �   �   +-- guards/
    �   �   �   �   +-- auth.guard.ts    # Redirects unauthenticated users to /auth/login
    �   �   �   �   +-- auth.guard.spec.ts
    �   �   �   +-- interceptors/
    �   �   �   �   +-- jwt.interceptor.ts  # Attaches Authorization: Bearer header
    �   �   �   +-- models/
    �   �   �   �   +-- auth.models.ts   # LoginRequest, RegisterRequest, AuthResponse
    �   �   �   �   +-- claim.models.ts  # Claim, CreateClaimRequest, ClaimDocument
    �   �   �   �   +-- policy.models.ts # Policy, PolicyType, CreatePolicyRequest
    �   �   �   �   +-- report.models.ts # Report, DashboardStats
    �   �   �   +-- services/
    �   �   �       +-- auth.service.ts      # login(), register(), logout(), getToken(), getUserId(), getRole()
    �   �   �       +-- auth.service.spec.ts # 18 Vitest tests
    �   �   �       +-- policy.service.ts    # getPolicies(), getPolicyTypes(), createPolicy(), activatePolicy()
    �   �   �       +-- claim.service.ts     # getClaims(), submitClaim(), uploadDocument()
    �   �   �       +-- admin.service.ts     # getDashboard(), getReports(), reviewClaim(), getAllClaims()
    �   �   �
    �   �   +-- auth/                    # AuthModule
    �   �   �   +-- auth-module.ts
    �   �   �   +-- auth-routing-module.ts
    �   �   �   +-- login/
    �   �   �   �   +-- login.component.ts
    �   �   �   �   +-- login.component.spec.ts  # 16 Vitest tests
    �   �   �   +-- register/
    �   �   �       +-- register.component.ts
    �   �   �
    �   �   +-- customer/                # CustomerModule
    �   �   �   +-- customer-module.ts
    �   �   �   +-- customer-routing-module.ts
    �   �   �   +-- dashboard/
    �   �   �   �   +-- dashboard.component.ts   # Summary cards, quick links
    �   �   �   +-- buy-policy/
    �   �   �   �   +-- buy-policy.component.ts  # 3-step wizard
    �   �   �   +-- policies/
    �   �   �   �   +-- policies.component.ts    # Policy list
    �   �   �   +-- policy-detail/
    �   �   �   �   +-- policy-detail.component.ts
    �   �   �   +-- upload-documents/
    �   �   �       +-- upload-documents.component.ts
    �   �   �
    �   �   +-- claims/                  # ClaimsModule
    �   �   �   +-- claims-module.ts
    �   �   �   +-- claims-routing-module.ts
    �   �   �   +-- initiate-claim/
    �   �   �   �   +-- initiate-claim.component.ts  # 4-step wizard
    �   �   �   +-- claim-tracking/
    �   �   �       +-- claim-tracking.component.ts
    �   �   �
    �   �   +-- admin/                   # AdminModule
    �   �   �   +-- admin-module.ts
    �   �   �   +-- admin-routing-module.ts
    �   �   �   +-- dashboard/
    �   �   �   �   +-- admin-dashboard.component.ts
    �   �   �   +-- claim-review/
    �   �   �   �   +-- claim-review.component.ts
    �   �   �   +-- policy-management/
    �   �   �   �   +-- policy-management.component.ts
    �   �   �   +-- user-management/
    �   �   �       +-- user-management.component.ts
    �   �   �
    �   �   +-- reports/                 # ReportsModule
    �   �   �   +-- reports-module.ts
    �   �   �   +-- reports-routing-module.ts
    �   �   �   +-- reports.component.ts # Charts + CSV export
    �   �   �
    �   �   +-- shared/                  # SharedModule
    �   �   �   +-- shared-module.ts
    �   �   �
    �   �   +-- landing/
    �   �       +-- landing.component.ts # Public landing page
    �   �
    �   +-- environments/
    �   �   +-- environment.ts           # { production: false, gatewayUrl: 'https://localhost:7000' }
    �   �   +-- environment.prod.ts      # Production environment config
    �   �
    �   +-- index.html                   # HTML entry point
    �   +-- main.ts                      # Angular bootstrap
    �   +-- styles.scss                  # Global SCSS styles
    �
    +-- angular.json                     # Angular CLI workspace configuration
    +-- package.json                     # npm dependencies (@angular/cli ^21.2.6)
    +-- tsconfig.json                    # TypeScript base config
    +-- tsconfig.app.json                # App-specific TypeScript config
    +-- tsconfig.spec.json               # Test-specific TypeScript config
```

---


## 14. Changelog

### v1.6 — UI Bug Fixes & Claim Review Deep-Link (May 2026)

**Frontend fixes:**

- **Upload button scope** — Document upload button now only appears for `Draft` claims. `Submitted` claims show an informational message instead of the upload button.
- **Buy Policy success message** — After confirming a policy purchase, a green success banner displays "Policy activated successfully! Redirecting to your policies..." with a 2-second delay before navigating to `/customer/policies`.
- **Submit Claim success message** — After submitting a claim, a green success banner displays "Claim submitted successfully! Redirecting to your claims..." with a 2-second delay before navigating to `/claims/track`.
- **Claim Review deep-link** — The "Review" button on the Admin Dashboard now passes `?claimId=X` as a query parameter. `ClaimReviewComponent.ngOnInit()` reads this parameter and auto-selects the specific claim in the review panel.
- **Claim Review stale data** — `openReview()` now fetches fresh claim data from the server on every selection. `submitReview()` reloads the full claims list after every status update.
- **Smart status dropdown** — The status dropdown in Claim Review only shows valid next statuses based on the claim's current status (using the `transitions` map).

---

### v1.5 — Security & Lifecycle Hardening (April 2026)

- Claim lifecycle transition guard in `ClaimService.UpdateClaimStatusAsync()` — invalid transitions return HTTP 400
- Policy lifecycle transition guard in `PolicyService.UpdatePolicyStatusAsync()` — same pattern
- Claim submit ownership check — JWT `UserId` must match `claim.CustomerId`, otherwise HTTP 403
- Email credentials moved to `appsettings.Development.json` (gitignored)
- MailKit upgraded to 4.16.0
- `DangerousAcceptAnyServerCertificateValidator` wrapped in `#if DEBUG` only
- Confirmation modals added for admin destructive actions (Approve, Reject, Close)
- 8 new NUnit tests for transition guards added

---

### v1.4 — Frontend Tests (April 2026)

- Migrated frontend test runner from Karma/Jasmine to **Vitest**
- 61 Vitest tests across 5 spec files (auth.service, jwt.interceptor, auth.guard, login.component, app)

---

### v1.3 — Full UI Redesign (April 2026)

- Sidebar + topbar layout, Font Awesome 6 icons, Bootstrap 5.3 + custom SCSS
- All admin and customer pages redesigned
- Reports page with Chart.js bar/pie charts
- Landing page with animated hero section

---

### v1.2 — Event-Driven Architecture (April 2026)

- MassTransit + RabbitMQ with PolicyPurchaseSaga and ClaimApprovalSaga
- SmartSure.SagaHost worker service and SmartSure.Contracts shared library
- MailKit email notifications (OTP + policy confirmation)

---

### v1.1 — Core Platform (April 2026)

- 4 ASP.NET Core 8 microservices, Ocelot API Gateway, Angular 21 frontend
- SQL Server with EF Core Code-First (4 separate databases)
- JWT authentication, BCrypt password hashing, OTP forgot-password flow
- Document upload (PDF, JPG, PNG, DOC, DOCX, max 10 MB)
- NUnit test suite

---

*SmartSure Insurance Management System � built with .NET 8 and Angular 21.*
