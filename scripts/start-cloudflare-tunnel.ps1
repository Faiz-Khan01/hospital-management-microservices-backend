<#
.SYNOPSIS
    Starts Cloudflare Quick Tunnel to expose HospitalSync API Gateway (Port 8080) to the public internet for free.
.DESCRIPTION
    Runs cloudflared tunnel --url http://localhost:8080 and displays the public HTTPS link to configure in Vercel.
#>

$CloudflaredPath = Join-Path $PSScriptRoot "..\tools\cloudflared.exe"

if (-not (Test-Path $CloudflaredPath)) {
    if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
        $CloudflaredPath = "cloudflared"
    } else {
        Write-Host "ERROR: cloudflared.exe not found in tools\ or PATH." -ForegroundColor Red
        Write-Host "Please wait for the download to complete or download from:" -ForegroundColor Yellow
        Write-Host "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "HospitalSync Pro - Cloudflare Quick Tunnel" -ForegroundColor Cyan
Write-Host "Target: http://localhost:8080 (Spring Cloud API Gateway)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Test if port 8080 is reachable
$conn = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue 2>$null
if (-not $conn.TcpTestSucceeded) {
    Write-Host "WARNING: Port 8080 is not currently listening." -ForegroundColor Yellow
    Write-Host "Make sure Docker Desktop is started and your backend is running:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting Cloudflare Tunnel... Look for the '.trycloudflare.com' link below!" -ForegroundColor Green
Write-Host "Copy that link and add it to Vercel as: VITE_API_BASE_URL = https://<your-link>/api/v1" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

& $CloudflaredPath tunnel --url http://localhost:8080
