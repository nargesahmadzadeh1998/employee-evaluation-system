@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 exit /b 1
)

echo Starting dev server on 0.0.0.0:3000...
call npx next dev -H 0.0.0.0 -p 3000

endlocal
