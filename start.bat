@echo off
echo ==========================================
echo  Employee Evaluation System - Setup
echo ==========================================
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 goto :error

echo Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 goto :error

echo Setting up database...
call npx prisma db push
if %errorlevel% neq 0 goto :error

echo Seeding database...
call npm run seed
if %errorlevel% neq 0 goto :error

echo Building app...
call npm run build
if %errorlevel% neq 0 goto :error

echo.
echo ==========================================
echo  Starting on http://localhost:3000
echo  Login: admin@example.com / admin123
echo ==========================================
echo.
call npm run start

goto :end

:error
echo.
echo Something went wrong. Check the error above.
pause

:end
