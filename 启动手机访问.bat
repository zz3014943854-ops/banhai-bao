@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo     辽传短剧 - 手机访问服务
echo ========================================
echo.

echo 📡 正在启动服务，端口 8080...
echo.

REM 获取本机局域网 IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" if not "!ip!"=="127.0.0.1" (
        echo 📱 手机浏览器打开以下地址:
        echo.
        echo    http://!ip!:8080/双击打开APP.html
        echo.
    )
)

echo ========================================
echo.
echo 按 Ctrl+C 可以停止服务
echo.

python -m http.server 8080
if errorlevel 1 (
    python3 -m http.server 8080
    if errorlevel 1 (
        py -m http.server 8080
        if errorlevel 1 (
            echo.
            echo ❌ 没找到 Python
            echo 请安装: https://www.python.org/downloads/
            echo 安装时勾选 "Add Python to PATH"
            pause
        )
    )
)
