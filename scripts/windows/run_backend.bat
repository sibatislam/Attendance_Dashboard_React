@echo off
setlocal enableextensions enabledelayedexpansion

cd /d "%~dp0..\.." 2>nul

if not exist .venv (
  echo [Backend] No virtualenv found. Creating one now...
  call scripts\windows\setup_backend.bat || (
    echo [Backend] Failed to create virtualenv.
    exit /b 1
  )
)

REM Check if venv Python exists and works
if not exist .venv\Scripts\python.exe (
  echo [Backend] Virtual environment Python not found. Recreating venv...
  rmdir /s /q .venv 2>nul
  call scripts\windows\setup_backend.bat || (
    echo [Backend] Failed to recreate virtualenv.
    exit /b 1
  )
)

REM Test if Python in venv actually works
.venv\Scripts\python.exe --version >nul 2>&1
if errorlevel 1 (
  echo [Backend] Virtual environment Python is broken. Recreating venv...
  rmdir /s /q .venv 2>nul
  call scripts\windows\setup_backend.bat || (
    echo [Backend] Failed to recreate virtualenv.
    exit /b 1
  )
)

REM Check Python version inside venv; warn if it's 3.14 but allow it
for /f "tokens=1,2 delims=." %%A in ('".venv\Scripts\python.exe" -c "import sys;print(sys.version_info.major, sys.version_info.minor)" 2^>nul') do set VENV_PY=%%A.%%B
if "%VENV_PY%"=="3.14" (
  echo [Backend] WARNING: Using Python 3.14. Some dependencies may have compatibility issues.
  echo [Backend] If you encounter issues, consider installing Python 3.11 or 3.12.
)

if not exist .venv\Scripts\activate.bat (
  echo [Backend] ERROR: Virtual environment activation script not found.
  exit /b 1
)

call .venv\Scripts\activate

REM Verify Python works after activation
python --version >nul 2>&1
if errorlevel 1 (
  echo [Backend] ERROR: Python not working after activation.
  exit /b 1
)

set PORT=8081
for /f "tokens=2 delims==" %%A in ('findstr /B /C:"BACKEND_PORT=" backend\.env 2^>nul') do set PORT=%%A

echo [Backend] Installing/Updating backend requirements...
python -m pip install --upgrade pip setuptools wheel
pip install --upgrade --upgrade-strategy eager -r backend\requirements.txt || (
  echo [Backend] Failed to install requirements. Aborting.
  exit /b 1
)

echo [Backend] Starting API on port %PORT% ...
python -m uvicorn app.main:app --reload --port %PORT% --host 0.0.0.0 --app-dir backend


