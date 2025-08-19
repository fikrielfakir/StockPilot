@echo off
echo Building StockCeramique Desktop Application for Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build frontend
echo Step 1/4: Building React frontend...
call npm run build
if errorlevel 1 (
    echo Error building frontend
    pause
    exit /b 1
)

REM Build desktop server
echo Step 2/4: Building desktop server...
if not exist "dist-desktop" mkdir dist-desktop
call npx esbuild server/index-desktop.ts --platform=node --packages=external --bundle --format=esm --outdir=dist-desktop
if errorlevel 1 (
    echo Error building desktop server
    pause
    exit /b 1
)

REM Copy necessary files
echo Step 3/4: Copying necessary files...
xcopy /E /I /Y electron dist-desktop\electron\
copy electron-builder.json dist-desktop\
if not exist "dist-desktop\data" mkdir dist-desktop\data

REM Build Electron executable
echo Step 4/4: Building Windows executable...
call npx electron-builder --config electron-builder.json --win
if errorlevel 1 (
    echo Error building Electron app
    pause
    exit /b 1
)

echo.
echo ======================================
echo BUILD COMPLETE!
echo ======================================
echo.
echo Your Windows executable is ready:
echo Location: dist-electron\StockCeramique Setup.exe
echo.
echo You can now:
echo 1. Install the app by running the Setup.exe
echo 2. Distribute the Setup.exe to other computers
echo 3. The app will work completely offline with local database
echo.
pause