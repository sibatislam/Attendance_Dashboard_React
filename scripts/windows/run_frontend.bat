@echo off
setlocal enableextensions enabledelayedexpansion

cd /d "%~dp0..\.." 2>nul

if not exist frontend (
  echo [Frontend] Missing frontend directory.
  exit /b 1
)

cd frontend

echo [Frontend] Ensuring dependencies are installed/updated...
call npm install

echo [Frontend] Starting Vite dev server...
npm run dev


