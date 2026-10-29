# Hospital Management System - API Smoke Test Runner
# Usage: .\smoke-test.ps1
# Requires: PowerShell 5.1+, API Gateway running on localhost:8080

$BASE = "http://localhost:8080"
$AUTH_DIRECT = "http://localhost:8086"
$EUREKA = "http://localhost:8761"
$passed = 0
$failed = 0

function Test-Endpoint {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [hashtable]$Headers = @{}, [string]$Body = "")
    try {
        $params = @{ Uri = $Url; Method = $Method; TimeoutSec = 10; ErrorAction = 'Stop' }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body -ne "" -and $Method -ne "GET") { $params.Body = $Body; $params.ContentType = "application/json" }
        $resp = Invoke-WebRequest @params -UseBasicParsing
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
            Write-Host "  [PASS] $Name ($($resp.StatusCode))" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "  [FAIL] $Name ($($resp.StatusCode))" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        $code = "N/A"
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $code = $_.Exception.Response.StatusCode.value__
        }
        if ($code -eq 401 -or $code -eq 403) {
            Write-Host "  [PASS] $Name (Auth Required: $code)" -ForegroundColor Cyan
            $script:passed++
        } elseif ($code -eq 200 -or $code -eq 201 -or $code -eq 204) {
            Write-Host "  [PASS] $Name ($code OK)" -ForegroundColor Green
            $script:passed++
        } elseif ($code -eq 400) {
            Write-Host "  [PASS] $Name ($code - Endpoint Active)" -ForegroundColor Cyan
            $script:passed++
        } else {
            $errMsg = if ($_.Exception.Message) { $_.Exception.Message } else { "Unknown error" }
            $maxLen = [Math]::Min(60, $errMsg.Length)
            Write-Host "  [FAIL] $Name - $($errMsg.Substring(0, $maxLen))" -ForegroundColor Red
            $script:failed++
        }
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  HospitalSync - API Smoke Test Suite" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# -- Step 1: Eureka Service Discovery --------------------------
Write-Host "1. Service Discovery (Eureka)" -ForegroundColor Yellow
Test-Endpoint "Eureka Dashboard" "$EUREKA/eureka/apps"
Test-Endpoint "Eureka Health" "$EUREKA/actuator/health"

# -- Step 2: Authenticate & Get JWT Token ----------------------
Write-Host ""
Write-Host "2. Authentication (auth-service)" -ForegroundColor Yellow

$loginBody = '{"username":"admin","password":"admin123"}'
$token = ""
try {
    $loginResp = Invoke-RestMethod -Uri "$BASE/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    if ($loginResp.data -and $loginResp.data.token) {
        $token = $loginResp.data.token
    } elseif ($loginResp.token) {
        $token = $loginResp.token
    } elseif ($loginResp.accessToken) {
        $token = $loginResp.accessToken
    }
    if ($token -ne "") {
        Write-Host "  [PASS] Login: JWT token obtained ($($token.Substring(0, [Math]::Min(20, $token.Length)))...)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [WARN] Login succeeded but no token in response" -ForegroundColor Yellow
    }
} catch {
    $respCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Offline" }
    Write-Host "  [INFO] Login endpoint returned: $respCode (service may be offline or need credentials)" -ForegroundColor DarkYellow
}

$authHeaders = @{}
if ($token -ne "") { $authHeaders = @{ Authorization = "Bearer $token" } }

Test-Endpoint "Forgot Password endpoint" "$BASE/api/v1/auth/forgot-password" "POST" @{} '{"email":"test@hospital.com"}'

# -- Step 3: API Gateway Routes --------------------------------
Write-Host ""
Write-Host "3. API Gateway Route Verification" -ForegroundColor Yellow
Test-Endpoint "Patients List" "$BASE/api/v1/patients" "GET" $authHeaders
Test-Endpoint "Doctors List" "$BASE/api/v1/doctors" "GET" $authHeaders
Test-Endpoint "Appointments List" "$BASE/api/v1/appointments" "GET" $authHeaders
Test-Endpoint "Prescriptions List" "$BASE/api/v1/prescriptions" "GET" $authHeaders
Test-Endpoint "Billing List" "$BASE/api/v1/billing" "GET" $authHeaders

# -- Step 4: Clinical & Inpatient Modules ----------------------
Write-Host ""
Write-Host "4. Clinical & Inpatient Modules" -ForegroundColor Yellow
Test-Endpoint "Medical Records" "$BASE/api/v1/medical-records" "GET" $authHeaders
Test-Endpoint "Beds List" "$BASE/api/v1/beds" "GET" $authHeaders
Test-Endpoint "Lab Tests" "$BASE/api/v1/lab-tests" "GET" $authHeaders
Test-Endpoint "Lab Reports" "$BASE/api/v1/lab-reports" "GET" $authHeaders
Test-Endpoint "Medicines" "$BASE/api/v1/medicines" "GET" $authHeaders
Test-Endpoint "Payments" "$BASE/api/v1/payments" "GET" $authHeaders

# -- Step 5: Support Services ----------------------------------
Write-Host ""
Write-Host "5. Support Services" -ForegroundColor Yellow
Test-Endpoint "Users (user-service)" "$BASE/api/v1/users" "GET" $authHeaders
Test-Endpoint "Departments" "$BASE/api/v1/departments" "GET" $authHeaders
Test-Endpoint "Roles" "$BASE/api/v1/roles" "GET" $authHeaders
Test-Endpoint "Notifications" "$BASE/api/v1/notifications" "GET" $authHeaders

# -- Step 6: Admin Dashboard -----------------------------------
Write-Host ""
Write-Host "6. Admin Dashboard API" -ForegroundColor Yellow
Test-Endpoint "Admin Dashboard" "$BASE/api/v1/users/dashboard/admin" "GET" $authHeaders

# -- Summary ---------------------------------------------------
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Results: $passed passed | $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "NOTE: Some failures may be expected if services are not running." -ForegroundColor DarkYellow
    Write-Host "Run 'docker compose up -d' from the project root to start all services." -ForegroundColor DarkYellow
}
