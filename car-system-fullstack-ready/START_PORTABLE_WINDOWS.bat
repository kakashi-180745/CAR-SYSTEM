@echo off
echo =========================================
echo CAR SYSTEM - ZERO-SETUP PORTABLE STARTER
echo (Node.js 22+ SQLite API + Vite React UI)
echo =========================================
echo.
start "CAR SYSTEM PORTABLE API" cmd /k "cd /d %~dp0backend-lite && npm install && npm start"
timeout /t 3 /nobreak >nul
start "CAR SYSTEM FRONTEND" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
