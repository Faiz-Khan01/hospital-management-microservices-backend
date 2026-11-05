#!/usr/bin/env bash
# ==============================================================================
# HospitalSync Pro Suite - Database Restore & Decryption Script
# Safely restores a .sql.gz or .sql.gz.enc backup file
# ==============================================================================
set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file> [target-database-name]"
    echo "Example: $0 backups/hospitalsync_backup_20261105_120000.sql.gz.enc"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-Password}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-HospitalSyncBackupSecurePassphrase2026}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

SQL_FILE="${TEMP_DIR}/restore.sql"

# Check if encrypted
if [[ "${BACKUP_FILE}" == *.enc ]]; then
    echo "Decrypting AES-256 encrypted backup..."
    openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
        -in "${BACKUP_FILE}" \
        -pass pass:"${BACKUP_ENCRYPTION_KEY}" \
        | gzip -d > "${SQL_FILE}"
elif [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "Decompressing GZip backup..."
    gzip -dc "${BACKUP_FILE}" > "${SQL_FILE}"
else
    cp "${BACKUP_FILE}" "${SQL_FILE}"
fi

echo "Restoring database from ${SQL_FILE}..."

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^hospital-mysql$"; then
    echo "Restoring into Docker container 'hospital-mysql'..."
    docker exec -i hospital-mysql mysql -u"${DB_USER}" -p"${DB_PASSWORD}" ${TARGET_DB} < "${SQL_FILE}"
elif command -v mysql &> /dev/null; then
    echo "Restoring via local MySQL CLI..."
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" ${TARGET_DB} < "${SQL_FILE}"
else
    echo "ERROR: Neither 'docker' container 'hospital-mysql' nor 'mysql' CLI is available."
    exit 1
fi

echo "Database restore completed successfully!"
