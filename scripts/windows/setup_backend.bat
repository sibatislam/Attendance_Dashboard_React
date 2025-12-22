@echo off
setlocal enableextensions enabledelayedexpansion

REM Change to repo root (this script is expected to be run from repo root, but handle if not)
cd /d "%~dp0..\.." 2>nul

echo [Backend] Checking for existing virtual environment...
if exist .venv (
  REM Check if venv Python actually exists
  if not exist .venv\Scripts\python.exe (
    echo [Backend] Virtual environment Python not found. Deleting broken venv...
    rmdir /s /q .venv 2>nul
  ) else (
    REM Test if Python in venv actually works
    .venv\Scripts\python.exe --version >nul 2>&1
    if errorlevel 1 (
      echo [Backend] Virtual environment Python is broken. Deleting venv...
      rmdir /s /q .venv 2>nul
    ) else (
      echo [Backend] Virtual environment exists and is valid.
      goto :venv_ready
    )
  )
)

echo [Backend] Creating virtual environment...
set PYTHON_CMD=

REM Try Python 3.11 first (preferred)
echo [Backend] Trying Python 3.11 for venv...
py -3.11 -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

REM Try Python 3.12
echo [Backend] Trying Python 3.12 for venv...
py -3.12 -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

REM Try Python 3.13
echo [Backend] Trying Python 3.13 for venv...
py -3.13 -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

REM Try Python 3.10
echo [Backend] Trying Python 3.10 for venv...
py -3.10 -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

REM Try default Python 3
echo [Backend] Trying default Python 3 for venv...
py -3 -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

REM Try Python 3.14 as fallback
echo [Backend] Trying Python 3.14 for venv (fallback)...
py -3.14 -m venv .venv >nul 2>&1
if not errorlevel 1 (
  echo [Backend] WARNING: Using Python 3.14. Some dependencies may have compatibility issues.
  goto :venv_created
)

REM Fallback to direct python command
echo [Backend] Trying 'python' command for venv...
python -m venv .venv >nul 2>&1
if not errorlevel 1 goto :venv_created

echo [Backend] ERROR: Could not create virtual environment. Please install Python 3.10 or later.
exit /b 1

:venv_created
echo [Backend] Virtual environment created successfully.
:venv_ready

echo [Backend] Activating virtual environment...
if not exist .venv\Scripts\activate.bat (
  echo [Backend] ERROR: Virtual environment activation script not found.
  exit /b 1
)
call .venv\Scripts\activate

REM Verify Python works after activation
python --version >nul 2>&1
if errorlevel 1 (
  echo [Backend] ERROR: Python not working in virtual environment.
  exit /b 1
)

echo [Backend] Upgrading pip...
python -m pip install --upgrade pip

echo [Backend] Installing requirements...
pip install -r backend\requirements.txt
if errorlevel 1 (
  echo [Backend] WARNING: Some requirements may have failed to install.
)

echo [Backend] Ensuring backend/.env exists...
if not exist backend\.env (
  echo DB_USER=root>backend\.env
  echo DB_PASSWORD=>>backend\.env
  echo DB_HOST=localhost>>backend\.env
  echo DB_PORT=3310>>backend\.env
  echo DB_NAME=attendance_db>>backend\.env
  echo [Backend] Created backend\.env with default values.
)

echo [Backend] Setup complete.
exit /b 0


