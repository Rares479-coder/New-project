@echo off
REM Porneste IDE-ul C/C++ (Windows)
cd /d "%~dp0"
where node >nul 2>nul || (echo Nu am gasit Node.js. Instaleaza-l de pe https://nodejs.org & pause & exit /b 1)
where g++ >nul 2>nul || echo Atentie: nu am gasit g++. Instaleaza MinGW-w64 (vezi ide\README.md).
if not exist node_modules call npm install
start "" http://localhost:3000
node server.js %*
pause
