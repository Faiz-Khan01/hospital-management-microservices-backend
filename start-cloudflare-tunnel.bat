@echo off
title HospitalSync Pro - Cloudflare Quick Tunnel
echo ==========================================================
echo Starting Cloudflare Tunnel for HospitalSync API Gateway
echo Target: http://localhost:8080
echo ==========================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start-cloudflare-tunnel.ps1"
pause
