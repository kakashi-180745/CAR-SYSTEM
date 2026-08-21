@echo off
echo =========================================
echo CAR SYSTEM - FULL STACK STARTER
echo =========================================
echo.
echo Make sure MySQL is running and car_ecommerce_ready.sql has been executed.
echo.
start "CAR SYSTEM BACKEND" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
start "CAR SYSTEM FRONTEND" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
