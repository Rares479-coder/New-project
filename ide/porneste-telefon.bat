@echo off
REM Porneste IDE-ul C/C++ accesibil de pe telefon (aceeasi retea Wi-Fi)
cd /d "%~dp0"
where node >nul 2>nul || (echo Nu am gasit Node.js. Instaleaza-l de pe https://nodejs.org & pause & exit /b 1)
if not exist node_modules call npm install
node server.js --retea %*
pause
