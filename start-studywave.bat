@echo off
echo ========================================
echo      StudyWave Full-Stack Startup
echo ========================================
echo.

echo Starting StudyWave Backend...
echo.
cd backend
start "StudyWave Backend" cmd /k "npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting StudyWave Frontend...
echo.
cd ..\studywave-attendance
start "StudyWave Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo StudyWave is starting up!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Accounts:
echo Professor: professor@studywave.ma / demo123
echo Student: student@studywave.ma / demo123
echo ========================================
echo.
pause
