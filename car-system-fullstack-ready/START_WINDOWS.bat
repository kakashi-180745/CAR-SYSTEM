@echo off
echo =========================================
echo CAR SYSTEM - SPRING BOOT + REACT STARTER
echo =========================================
echo.
if "%BOOTSTRAP_ADMIN_EMAIL%"=="" set BOOTSTRAP_ADMIN_EMAIL=admin@carsystem.com
if "%BOOTSTRAP_ADMIN_PASSWORD%"=="" set BOOTSTRAP_ADMIN_PASSWORD=Admin@1234
if "%ADMIN_SIGNUP_CODE%"=="" set ADMIN_SIGNUP_CODE=CAR-ADMIN-2026
echo Make sure MySQL is running (or pass -Dspring-boot.run.profiles=h2 in START_BACKEND_WINDOWS.bat).
echo.
start "CAR SYSTEM BACKEND" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
start "CAR SYSTEM FRONTEND" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
