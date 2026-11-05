<#
.SYNOPSIS
    Automated MySQL database backup script for HospitalSync Pro Suite.
.DESCRIPTION
    Dumps all hospital microservice databases, compresses with gzip, and applies retention policy.
    Can be scheduled via Windows Task Scheduler.
#>

param(
    [string]$BackupDir = (Join-Path $PSScriptRoot "..\backups"),
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }),
    [int]$DbPort = $(if ($env:DB_PORT) { [int]$env:DB_PORT } else { 3306 }),
    [string]$DbUser = $(if ($env:DB_USER) { $env:DB_USER } else { "root" }),
    [string]$DbPassword = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "Password" }),
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "hospitalsync_backup_$Timestamp.sql"
$BackupFilePath = Join-Path $BackupDir $BackupFileName
$GzFilePath = "$BackupFilePath.gz"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "HospitalSync Pro - Automated Database Backup" -ForegroundColor Cyan
Write-Host "Timestamp : $Timestamp" -ForegroundColor Cyan
Write-Host "Database  : All databases (microservices)" -ForegroundColor Cyan
Write-Host "Destination: $GzFilePath" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Execute mysqldump
try {
    # If Docker container 'hospital-mysql' is running, prefer dumping directly via docker exec
    $dockerRunning = docker ps --filter "name=hospital-mysql" --format "{{.Names}}" 2>$null
    if ($dockerRunning -eq "hospital-mysql") {
        Write-Host "Running mysqldump inside Docker container 'hospital-mysql'..." -ForegroundColor Green
        docker exec -i hospital-mysql mysqldump -u$DbUser -p$DbPassword --all-databases --single-transaction --quick > $BackupFilePath
    } elseif (Get-Command mysqldump -ErrorAction SilentlyContinue) {
        Write-Host "Running native mysqldump on $DbHost:$DbPort..." -ForegroundColor Green
        & mysqldump -h $DbHost -P $DbPort -u $DbUser "-p$DbPassword" --all-databases --single-transaction --quick > $BackupFilePath
    } else {
        throw "Neither 'docker' with running 'hospital-mysql' nor 'mysqldump' CLI was found."
    }

    if ((Test-Path $BackupFilePath) -and ((Get-Item $BackupFilePath).Length -gt 0)) {
        Write-Host "Raw dump created ($((Get-Item $BackupFilePath).Length) bytes). Compressing..." -ForegroundColor Green
        
        # Compress using .NET GZipStream
        $srcFile = [System.IO.File]::OpenRead($BackupFilePath)
        $dstFile = [System.IO.File]::Create($GzFilePath)
        $gzip = New-Object System.IO.Compression.GZipStream($dstFile, [System.IO.Compression.CompressionMode]::Compress)
        $srcFile.CopyTo($gzip)
        $gzip.Close()
        $srcFile.Close()
        $dstFile.Close()

        Remove-Item -Path $BackupFilePath -Force
        Write-Host "Compressed backup saved: $GzFilePath ($((Get-Item $GzFilePath).Length) bytes)" -ForegroundColor Green
    } else {
        throw "Backup dump file was empty or failed to generate."
    }

    # 2. Retention Policy: Purge backups older than RetentionDays
    Write-Host "Checking retention policy (keeping last $RetentionDays days)..." -ForegroundColor Cyan
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $BackupDir -Filter "hospitalsync_backup_*.sql.gz" | Where-Object { $_.CreationTime -lt $CutoffDate } | ForEach-Object {
        Write-Host "Purging expired backup: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }

    Write-Host "Backup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Backup failed: $_" -ForegroundColor Red
    exit 1
}
