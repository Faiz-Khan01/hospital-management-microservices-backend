<#
.SYNOPSIS
    Generates self-signed TLS/SSL certificate and private key for local/staging HTTPS testing.
.DESCRIPTION
    Creates fullchain.pem and privkey.pem in certs/ directory with SAN (Subject Alternative Name)
    for localhost, 127.0.0.1, and hospital.local.
#>

$CertsDir = Join-Path $PSScriptRoot "..\certs"
if (-not (Test-Path $CertsDir)) {
    New-Item -ItemType Directory -Path $CertsDir | Out-Null
}

$CertPath = Join-Path $CertsDir "fullchain.pem"
$KeyPath = Join-Path $CertsDir "privkey.pem"

Write-Host "Checking for OpenSSL..." -ForegroundColor Cyan

if (Get-Command openssl -ErrorAction SilentlyContinue) {
    Write-Host "Generating 2048-bit RSA TLS/SSL certificate with OpenSSL..." -ForegroundColor Green
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $KeyPath `
        -out $CertPath `
        -subj "/C=IN/ST=Delhi/L=NewDelhi/O=HospitalSync/OU=IT/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,DNS:hospital.local,IP:127.0.0.1"
    Write-Host "Success! Certificates created at: $CertsDir" -ForegroundColor Green
} else {
    Write-Host "Generating self-signed certificate with PowerShell PKI module..." -ForegroundColor Yellow
    $cert = New-SelfSignedCertificate `
        -DnsName "localhost", "hospital.local" `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -NotAfter (Get-Date).AddYears(1)

    $certPem = @"
-----BEGIN CERTIFICATE-----
$([Convert]::ToBase64String($cert.RawData, [System.Base64FormattingOptions]::InsertLineBreaks))
-----END CERTIFICATE-----
"@
    Set-Content -Path $CertPath -Value $certPem -Encoding Ascii
    Write-Host "Certificate exported to $CertPath" -ForegroundColor Green
}
