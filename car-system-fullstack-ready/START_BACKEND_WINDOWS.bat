@echo off
if "%BOOTSTRAP_ADMIN_EMAIL%"=="" set BOOTSTRAP_ADMIN_EMAIL=admin@carsystem.com
if "%BOOTSTRAP_ADMIN_PASSWORD%"=="" set BOOTSTRAP_ADMIN_PASSWORD=Admin@1234
if "%ADMIN_SIGNUP_CODE%"=="" set ADMIN_SIGNUP_CODE=CAR-ADMIN-2026
cd /d "%~dp0backend"
mvn clean spring-boot:run
pause
