@echo off
setlocal enableextensions enabledelayedexpansion

REM Change to repo root (this script is expected to be run from repo root, but handle if not)
cd /d "%~dp0..\.." 2>nul

echo [Backend] Creating virtual environment if missing...
if not exist .venv (
  where py >nul 2>nul && (
    echo [Backend] Trying Python 3.11 for venv...
    py -3.11 -m venv .venv 2>nul || (
      echo [Backend] Trying Python 3.10 for venv...
      py -3.10 -m venv .venv 2>nul || (
        echo [Backend] Falling back to default Python for venv...
        py -3 -m venv .venv 2>nul || (
          python -m venv .venv
        )
      )
    )
  ) || (
    python -m venv .venv
  )
)

echo [Backend] Activating virtual environment...
call .venv\Scripts\activate

echo [Backend] Upgrading pip...
python -m pip install --upgrade pip

echo [Backend] Installing requirements...
pip install -r backend\requirements.txt

echo [Backend] Ensuring backend/.env exists...
if not exist backend\.env (
  echo DB_USER=root>backend\.env
  echo DB_PASSWORD=>>backend\.env
  echo DB_HOST=localhost>>backend\.env
  echo DB_PORT=3306>>backend\.env
  echo DB_NAME=attendance_db>>backend\.env
  echo [Backend] Created backend\.env with default values.
)

echo [Backend] Setup complete.
exit /b 0


