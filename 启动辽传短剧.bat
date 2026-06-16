@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "dist\index.html" (
  echo App files are missing.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
