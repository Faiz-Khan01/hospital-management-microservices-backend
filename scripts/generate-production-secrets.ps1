# ==============================================================================
# HospitalSync Pro - Cryptographic Secrets Generator for Production
# Generates high-entropy secrets for JWT, MySQL, Redis, and API Gateway
# Usage: .\scripts\generate-production-secrets.ps1 [-OutputFile <path>]
# ==============================================================================

param(
    [string]$OutputFile = ".env.production"
)

function Get-SecureToken([int]$bytes = 32) {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $buf = New-Object byte[] $bytes
    $rng.GetBytes($buf)
    return [Convert]::ToBase64String($buf).Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

function Get-SecurePassword([int]$length = 24) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $buf = New-Object byte[] $length
    $rng.GetBytes($buf)
    $sb = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $length; $i++) {
        $idx = $buf[$i] % $chars.Length
        [void]$sb.Append($chars[$idx])
    }
    return $sb.ToString()
}

Write-Host "Generating cryptographically secure production keys for HospitalSync Pro..." -ForegroundColor Cyan

$jwtSecret = Get-SecureToken 64     # 512-bit HMAC-SHA Key
$dbPassword = Get-SecurePassword 28 # 28-char high-entropy DB password
$redisPassword = Get-SecurePassword 28
$apiKeyGateway = Get-SecureToken 32
$razorpaySecret = Get-SecureToken 32

$content = @"
# ==============================================================================
# HospitalSync Pro Suite - Production Environment Configuration
# GENERATED ON: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# DO NOT COMMIT THIS FILE TO SOURCE CONTROL
# ==============================================================================

# 1. Environment & Profiles
SPRING_PROFILES_ACTIVE=prod
NODE_ENV=production

# 2. Security & Authentication (512-bit cryptographically secure key)
JWT_SECRET=$jwtSecret
JWT_EXPIRATION_MS=86400000

# 3. Database (MySQL 8.0 Enterprise / AWS RDS)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=hospital_management_db
DB_USER=hospitalsync_admin
DB_PASSWORD=$dbPassword

# 4. In-Memory Cache (Redis 7 Enterprise)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redisPassword

# 5. Service Discovery (Eureka Registry)
EUREKA_SERVER_URL=http://naming-server:8761/eureka/

# 6. API Gateway Configuration
GATEWAY_PORT=8080
GATEWAY_SECRET_KEY=$apiKeyGateway

# 7. Payment Integration (Production Credentials)
RAZORPAY_KEY_ID=rzp_live_production
RAZORPAY_KEY_SECRET=$razorpaySecret

# 8. Frontend Production Endpoints
VITE_API_GATEWAY_URL=/api/v1
"@

Set-Content -Path $OutputFile -Value $content -Encoding utf8
Write-Host "Secure production secrets successfully generated at: $OutputFile" -ForegroundColor Green
Write-Host "Keep this file strictly confidential and inject via AWS Secrets Manager or Kubernetes Secrets." -ForegroundColor Yellow
