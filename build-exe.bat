@echo off
rem =====================================================
rem  Quran Numerical Studies - build the Windows program (portable exe)
rem  Double-click this file. The exe appears in "desktop\release".
rem  It runs offline on any Windows PC without installation.
rem =====================================================
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js / npm was not found.
  echo Install Node.js 20 or newer from https://nodejs.org and try again.
  goto :fail
)

if not exist "node_modules" (
  echo Installing dependencies, first time only...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    goto :fail
  )
)

echo.
echo [1/2] Testing calculations and data...
call npm test
if errorlevel 1 (
  goto :fail
)

echo.
echo [2/2] Building the site and the portable exe, this takes a few minutes...
echo If it stops with "Lock file is already being held", close any window
echo showing the desktop\release folder and run this file again.
call npm run build:exe
if errorlevel 1 (
  goto :fail
)

echo.
echo Done. Program ready in "desktop\release":
dir /b /o-d "desktop\release\*.exe"
if not "%NO_PAUSE%"=="1" (
  start "" "%~dp0desktop\release"
  pause
)
exit /b 0

:fail
echo.
echo [ERROR] Build failed. Read the messages above.
if not "%NO_PAUSE%"=="1" (
  pause
)
exit /b 1
