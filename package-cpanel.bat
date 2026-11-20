@echo off
rem =====================================================
rem  Quran Numerical Studies - build the cPanel package
rem  Double-click this file. The zip appears in the "release" folder.
rem  Upload it to /public_html/quran.phsoft.me in cPanel File Manager,
rem  then right-click it and choose Extract.
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
echo [2/2] Building the site and the cPanel package...
call npm run package:cpanel
if errorlevel 1 (
  goto :fail
)

echo.
echo Done. Package ready in the "release" folder:
dir /b /o-d "release\*.zip"
if not "%NO_PAUSE%"=="1" (
  start "" "%~dp0release"
  pause
)
exit /b 0

:fail
echo.
echo [ERROR] Packaging failed. Read the messages above.
if not "%NO_PAUSE%"=="1" (
  pause
)
exit /b 1
