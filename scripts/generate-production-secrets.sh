#!/usr/bin/env bash
# ==============================================================================
# HospitalSync Pro - Cryptographic Secrets Generator for Production (Linux/Mac)
# Generates high-entropy secrets for JWT, MySQL, Redis, and API Gateway
# Usage: ./scripts/generate-production-secrets.sh [.env.production]
# ==============================================================================

set -euo pipefail

OUTPUT_FILE="${1:-.env.production}"

get_secure_token() {
    local bytes="${1:-32}"
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 "$bytes" | tr -d '\n/+' | cut -c1-"$bytes"
    else
        head -c "$bytes" /dev/urandom | base64 | tr -d '\n/+' | cut -c1-"$bytes"
    fi
}

echo "Generating cryptographically secure production keys for HospitalSync Pro..."

JWT_SECRET=$(get_secure_token 64)
DB_PASSWORD=$(get_secure_token 28)
REDIS_PASSWORD=$(get_secure_token 28)
GATEWAY_SECRET=$(get_secure_token 32)
RAZORPAY_SECRET=$(get_secure_token 32)

cat <<EOF > "$OUTPUT_FILE"
# ==============================================================================
# HospitalSync Pro Suite - Production Environment Configuration
# GENERATED ON: $(date -u +"%Y-%m-%d %H:%M:%SZ")
# DO NOT COMMIT THIS FILE TO SOURCE CONTROL
# ==============================================================================

# 1. Environment & Profiles
SPRING_PROFILES_ACTIVE=prod
NODE_ENV=production

# 2. Security & Authentication (512-bit cryptographically secure key)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION_MS=86400000

# 3. Database (MySQL 8.0 Enterprise / AWS RDS)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=hospital_management_db
DB_USER=hospitalsync_admin
DB_PASSWORD=${DB_PASSWORD}

# 4. In-Memory Cache (Redis 7 Enterprise)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# 5. Service Discovery (Eureka Registry)
EUREKA_SERVER_URL=http://naming-server:8761/eureka/

# 6. API Gateway Configuration
GATEWAY_PORT=8080
GATEWAY_SECRET_KEY=${GATEWAY_SECRET}

# 7. Payment Integration (Production Credentials)
RAZORPAY_KEY_ID=rzp_live_production
RAZORPAY_KEY_SECRET=${RAZORPAY_SECRET}

# 8. Frontend Production Endpoints
VITE_API_GATEWAY_URL=/api/v1
EOF

chmod 600 "$OUTPUT_FILE"
echo "Secure production secrets successfully generated at: $OUTPUT_FILE"
echo "Inject this file via AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets."
