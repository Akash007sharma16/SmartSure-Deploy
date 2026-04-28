#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════
#  SmartSure — Run ALL Unit Tests in One Command
#  Usage: .\run-tests.ps1
#  Works even while services are running in Visual Studio
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

$testProjects = @(
    "tests/IdentityService.Tests/IdentityService.Tests.csproj",
    "tests/PolicyService.Tests/PolicyService.Tests.csproj",
    "tests/ClaimsService.Tests/ClaimsService.Tests.csproj",
    "tests/AdminService.Tests/AdminService.Tests.csproj"
)

$totalPassed  = 0
$totalFailed  = 0
$totalSkipped = 0
$results      = @()
$anyFailed    = $false

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       SmartSure — Running All Unit Tests             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Build all test projects (skip rebuilding locked service DLLs) ──
Write-Host "► Building test projects..." -ForegroundColor Yellow
foreach ($proj in $testProjects) {
    $name = Split-Path (Split-Path $proj) -Leaf
    $build = dotnet build $proj /p:BuildProjectReferences=false --nologo -q 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Build FAILED: $name" -ForegroundColor Red
        Write-Host $build -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ $name" -ForegroundColor Green
}

Write-Host ""
Write-Host "► Running tests..." -ForegroundColor Yellow
Write-Host ""

# ── Step 2: Run each test project ──
foreach ($proj in $testProjects) {
    $name = Split-Path (Split-Path $proj) -Leaf

    $output = dotnet test $proj `
        --no-build `
        --settings tests.runsettings `
        --logger "console;verbosity=minimal" `
        2>&1

    # Parse results
    $summary = $output | Select-String "Passed!|Failed!"
    $passed  = 0
    $failed  = 0
    $skipped = 0

    if ($summary) {
        $line = $summary[-1].Line
        if ($line -match "Passed:\s*(\d+)") { $passed  = [int]$Matches[1] }
        if ($line -match "Failed:\s*(\d+)") { $failed  = [int]$Matches[1] }
        if ($line -match "Skipped:\s*(\d+)"){ $skipped = [int]$Matches[1] }
    }

    $totalPassed  += $passed
    $totalFailed  += $failed
    $totalSkipped += $skipped

    $status = if ($failed -gt 0) { "FAIL" } else { "PASS" }
    $color  = if ($failed -gt 0) { "Red" } else { "Green" }
    $icon   = if ($failed -gt 0) { "✗" } else { "✓" }

    if ($failed -gt 0) { $anyFailed = $true }

    $results += [PSCustomObject]@{
        Suite   = $name
        Status  = $status
        Passed  = $passed
        Failed  = $failed
        Skipped = $skipped
    }

    Write-Host "  $icon $name" -ForegroundColor $color -NoNewline
    Write-Host "  →  Passed: $passed  Failed: $failed  Skipped: $skipped" -ForegroundColor White

    # Show failed test details if any
    if ($failed -gt 0) {
        $output | Select-String "FAILED|Error Message" | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Red
        }
    }
}

# ── Step 3: Summary ──
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   TEST SUMMARY                      ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Cyan

foreach ($r in $results) {
    $color = if ($r.Failed -gt 0) { "Red" } else { "Green" }
    $icon  = if ($r.Failed -gt 0) { "✗" } else { "✓" }
    $line  = "║  $icon  $($r.Suite.PadRight(35)) P:$($r.Passed)  F:$($r.Failed)  S:$($r.Skipped)  ║"
    Write-Host $line -ForegroundColor $color
}

Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Cyan

$totalColor = if ($anyFailed) { "Red" } else { "Green" }
$totalIcon  = if ($anyFailed) { "✗ FAILED" } else { "✓ ALL PASSED" }
Write-Host "║  $totalIcon  —  Total: Passed=$totalPassed  Failed=$totalFailed  Skipped=$totalSkipped" -ForegroundColor $totalColor
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($anyFailed) {
    Write-Host "Some tests FAILED. Check output above for details." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All tests passed successfully!" -ForegroundColor Green
    exit 0
}
