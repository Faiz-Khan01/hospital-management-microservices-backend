#!/usr/bin/env bash
# ==============================================================================
# HospitalSync Pro Suite - Automated MySQL Database Backup Script
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
RETENTION_DAYS=14

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-Password}"

mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/hospitalsync_backup_${TIMESTAMP}.sql.gz"

echo "=========================================================="
echo "HospitalSync Pro - Automated Database Backup"
echo "Timestamp  : ${TIMESTAMP}"
echo "Destination: ${BACKUP_FILE}"
echo "=========================================================="

# Check if Docker container hospital-mysql is running
if docker ps --format '{{.Names}}' | grep -q "^hospital-mysql$"; then
    echo "Running mysqldump inside Docker container 'hospital-mysql'..."
    docker exec hospital-mysql mysqldump \
        -u"${DB_USER}" \
        -p"${DB_PASSWORD}" \
        --all-databases \
        --single-transaction \
        --quick \
        | gzip -9 > "${BACKUP_FILE}"
elif command -v mysqldump &> /dev/null; then
    echo "Running native mysqldump on ${DB_HOST}:${DB_PORT}..."
    mysqldump \
        -h "${DB_HOST}" \
        -P "${DB_PORT}" \
        -u "${DB_USER}" \
        -p"${DB_PASSWORD}" \
        --all-databases \
        --single-transaction \
        --quick \
        | gzip -9 > "${BACKUP_FILE}"
else
    echo "ERROR: Neither 'docker' container 'hospital-mysql' nor 'mysqldump' CLI is available."
    exit 1
fi

FILE_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "Backup successfully created: ${BACKUP_FILE} (${FILE_SIZE})"

# Retention Policy: Delete backups older than RETENTION_DAYS
echo "Applying retention policy: purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "hospitalsync_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} +

echo "Backup and retention rotation complete!"
