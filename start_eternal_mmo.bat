@echo off
SETLOCAL

cd /d "%~dp0"
set "PATH=C:\tools\nodejs;%PATH%"
set "NODE_ENV=production"
set "PORT=3000"

if not exist "logs" mkdir "logs"

if exist ".next\standalone" (
  copy /Y ".env" ".next\standalone\.env" >nul
  if not exist ".next\standalone\.next" mkdir ".next\standalone\.next"
  if not exist ".next\standalone\public" mkdir ".next\standalone\public"
  xcopy /E /I /Y ".next\static" ".next\standalone\.next\static" >nul
  xcopy /E /I /Y "public" ".next\standalone\public" >nul
  node ".next\standalone\server.js" 1>>"logs\node-server.log" 2>>"logs\node-server.err"
) else (
  npm start
)

ENDLOCAL
