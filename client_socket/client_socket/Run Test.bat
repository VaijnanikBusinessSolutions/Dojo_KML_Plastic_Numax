@echo off
setlocal

:: Set the path to the client directory
set CLIENT_DIR=C:\Users\Administrator\Desktop\IJL_Dojo_2.0\client_socket
@REM set CLIENT_DIR=C:\Users\jithi\OneDrive\Desktop\IJL_Dojo_2.0\IJL_Dojo_2.0\client_socket
set PYTHON_EXE=python

:: Check if Python is installed
%PYTHON_EXE% --version >nul 2>&1
if errorlevel 1 (
    echo Python not found. Downloading and installing Python...
    set PYTHON_INSTALLER=python-installer.exe

    :: Download Python silently
    powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.11.6/python-3.11.6-amd64.exe -OutFile %PYTHON_INSTALLER%"

    :: Install Python silently (Add to PATH, install for all users)
    start /wait "" %PYTHON_INSTALLER% /quiet InstallAllUsers=1 PrependPath=1 Include_test=0

    :: Clean up installer
    del %PYTHON_INSTALLER%

    :: Refresh environment
    set PYTHON_EXE=python
)

:: Confirm Python works now
%PYTHON_EXE% --version >nul 2>&1
if errorlevel 1 (
    echo Python installation failed. Exiting.
    pause
    exit /b 1
)

:: Change to client directory
cd /d "%CLIENT_DIR%"

:: If there's a requirements.txt, install dependencies
if exist requirements.txt (
    echo Installing Python dependencies...
    %PYTHON_EXE% -m pip install -r requirements.txt
)

:: Launch client.py minimized
echo Starting client.py...
powershell -windowstyle Minimized -command "Start-Process cmd -ArgumentList '/k cd /d \"%CLIENT_DIR%\" && python client.py' -WindowStyle Minimized"

echo All services started.
exit
