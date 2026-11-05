<#
.SYNOPSIS
    Restores and decrypts HospitalSync MySQL database backups.
.DESCRIPTION
    Decrypts .sql.gz.enc using OpenSSL, decompresses gzip, and pipes SQL into MySQL.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$TargetDatabase = "",
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }),
    [int]$DbPort = $(if ($env:DB_PORT) { [int]$env:DB_PORT } else { 3306 }),
    [string]$DbUser = $(if ($env:DB_USER) { $env:DB_USER } else { "root" }),
    [string]$DbPassword = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "Password" }),
    [string]$EncryptionKey = $(if ($env:BACKUP_ENCRYPTION_KEY) { $env:BACKUP_ENCRYPTION_KEY } else { "HospitalSyncBackupSecurePassphrase2026" })
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

$TempDir = Join-Path $env:TEMP "hospitalsync_restore_$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $TempDir | Out-Null
$SqlFile = Join-Path $TempDir "restore.sql"

try {
    if ($BackupFile.EndsWith(".enc")) {
        Write-Host "Decrypting AES-256 backup with OpenSSL..." -ForegroundColor Green
        $GzTemp = Join-Path $TempDir "temp.gz"
        openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 `
            -in $BackupFile `
            -out $GzTemp `
            -pass "pass:$EncryptionKey"

        # Decompress GZip
        $srcFile = [System.IO.File]::OpenRead($GzTemp)
        $dstFile = [System.IO.File]::Create($SqlFile)
        $gzip = New-Object System.IO.Compression.GZipStream($srcFile, [System.IO.Compression.CompressionMode]::Decompress)
        $gzip.CopyTo($dstFile)
        $gzip.Close()
        $srcFile.Close()
        $dstFile.Close()
    } elseif ($BackupFile.EndsWith(".gz")) {
        Write-Host "Decompressing GZip backup..." -ForegroundColor Green
        $srcFile = [System.IO.File]::OpenRead($BackupFile)
        $dstFile = [System.IO.File]::Create($SqlFile)
        $gzip = New-Object System.IO.Compression.GZipStream($srcFile, [System.IO.Compression.CompressionMode]::Decompress)
        $gzip.CopyTo($dstFile)
        $gzip.Close()
        $srcFile.Close()
        $dstFile.Close()
    } else {
        Copy-Item -Path $BackupFile -Destination $SqlFile
    }

    Write-Host "Restoring database into MySQL..." -ForegroundColor Green
    $dockerRunning = docker ps --filter "name=hospital-mysql" --format "{{.Names}}" 2>$null
    if ($dockerRunning -eq "hospital-mysql") {
        Write-Host "Restoring inside Docker container 'hospital-mysql'..." -ForegroundColor Green
        Get-Content $SqlFile | docker exec -i hospital-mysql mysql -u$DbUser -p$DbPassword $TargetDatabase
    } elseif (Get-Command mysql -ErrorAction SilentlyContinue) {
        Write-Host "Restoring via local MySQL CLI..." -ForegroundColor Green
        Get-Content $SqlFile | & mysql -h $DbHost -P $DbPort -u $DbUser "-p$DbPassword" $TargetDatabase
    } else {
        throw "Neither 'docker' with running 'hospital-mysql' nor 'mysql' CLI was found."
    }

    Write-Host "Database restore completed successfully!" -ForegroundColor Green
} finally {
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force
    }
}
