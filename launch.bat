@echo off
REM ─── HR Management System - Windows Launcher ───────────────────
REM Double-click this file to launch the app on Windows.

set "APP_NAME=HR Management System"
set "DIR=%~dp0"

REM Try to launch the built app first
if exist "%DIR%dist\win\%APP_NAME%.exe" (
    echo Launching %APP_NAME%...
    start "" "%DIR%dist\win\%APP_NAME%.exe"
    goto :EOF
)

REM Try to launch via npm
if exist "%DIR%node_modules\.bin\electron.cmd" (
    echo Launching %APP_NAME% in development mode...
    cd /d "%DIR%"
    npx electron .
    goto :EOF
)

echo Error: Could not find %APP_NAME%.
echo Run 'npm install' then 'npm start' from the project directory.
pause
