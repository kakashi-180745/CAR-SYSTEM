@echo off
cd /d "%~dp0backend"
mvn clean spring-boot:run
pause
