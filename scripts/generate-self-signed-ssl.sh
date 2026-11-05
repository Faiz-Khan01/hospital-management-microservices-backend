#!/usr/bin/env bash
# ==============================================================================
# Generate Self-Signed TLS/SSL Certificates for Local / Staging Testing
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/../certs"

mkdir -p "${CERTS_DIR}"

CERT_PATH="${CERTS_DIR}/fullchain.pem"
KEY_PATH="${CERTS_DIR}/privkey.pem"

echo "Generating 2048-bit RSA TLS/SSL certificate with OpenSSL..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${KEY_PATH}" \
    -out "${CERT_PATH}" \
    -subj "/C=IN/ST=Delhi/L=NewDelhi/O=HospitalSync/OU=IT/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:hospital.local,IP:127.0.0.1"

chmod 600 "${KEY_PATH}"
chmod 644 "${CERT_PATH}"

echo "Certificates successfully created:"
echo "  - Certificate: ${CERT_PATH}"
echo "  - Private Key: ${KEY_PATH}"
