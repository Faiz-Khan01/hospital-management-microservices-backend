# ==============================================================================
# HospitalSync Pro - Local Development Orchestrator
# Starts all required microservices & frontend in individual lightweight jobs
# Usage: .\start-local.ps1
# ==============================================================================

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$StopAll
)

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "hospital-management-backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "hospital-management-frontend"

# Load .env if present
$ENV_FILE = Join-Path $ROOT_DIR ".env"
if (Test-Path $ENV_FILE) {
    Get-Content $ENV_FILE | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
        }
    }
}

if ($StopAll) {
    Write-Host "Stopping all Java and Node processes related to HospitalSync..." -ForegroundColor Yellow
    Get-Process -Name "java", "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All processes terminated." -ForegroundColor Green
    exit 0
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       HospitalSync Pro - Full Stack Local Orchestrator     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check Infrastructure Dependencies
Write-Host "`n[1/4] Checking Infrastructure Prerequisites..." -ForegroundColor Yellow

# MySQL check
$mysqlRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 3306)
    $mysqlRunning = $tcp.Connected
    $tcp.Close()
} catch {}

if ($mysqlRunning) {
    Write-Host "  [OK] MySQL Server is listening on port 3306" -ForegroundColor Green
} else {
    Write-Host "  [WARN] MySQL Server not responding on 3306. Starting might cause datasource errors." -ForegroundColor DarkYellow
}

# Redis check
$redisRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 6379)
    $redisRunning = $tcp.Connected
    $tcp.Close()
} catch {}

if ($redisRunning) {
    Write-Host "  [OK] Redis Cache is listening on port 6379" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Redis Cache offline (caching will fall back safely)" -ForegroundColor DarkGray
}

if (-not $FrontendOnly) {
    Write-Host "`n[2/4] Starting Microservice Discovery & Gateway..." -ForegroundColor Yellow

    # Naming Server
    $namingPath = Join-Path $BACKEND_DIR "naming-server\naming-server"
    Write-Host "  -> Launching Eureka Naming Server (Port 8761)..." -ForegroundColor White
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $namingPath -WindowStyle Minimized

    Start-Sleep -Seconds 8

    # API Gateway
    $gatewayPath = Join-Path $BACKEND_DIR "api-gateway\api-gateway"
    Write-Host "  -> Launching Spring Cloud API Gateway (Port 8080)..." -ForegroundColor White
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $gatewayPath -WindowStyle Minimized

    Write-Host "`n[3/4] Core Domain Microservices can be started from IntelliJ / Maven CLI as needed." -ForegroundColor Yellow
}

if (-not $BackendOnly) {
    Write-Host "`n[4/4] Starting Frontend Vite Development Server..." -ForegroundColor Yellow
    Write-Host "  -> Starting React Vite UI on http://localhost:5173..." -ForegroundColor White
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $FRONTEND_DIR -WindowStyle Normal
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Platform Launch Initiated!" -ForegroundColor Green
Write-Host "  - UI Portal:       http://localhost:5173" -ForegroundColor White
Write-Host "  - API Gateway:     http://localhost:8080" -ForegroundColor White
Write-Host "  - Eureka Server:   http://localhost:8761" -ForegroundColor White
Write-Host "  - Smoke Test:      Run .\smoke-test.ps1" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
