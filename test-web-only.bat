@echo off
echo Starting CareerFlow in web-only mode for testing...
echo.
echo This bypasses the Rust compilation issues by running the frontend only.
echo Note: Tauri-specific features will not work in this mode.
echo.

cd /d "%~dp0"

REM Start Vite dev server
npm run dev

pause
