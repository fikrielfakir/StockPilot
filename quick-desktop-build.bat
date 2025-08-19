@echo off
echo Quick Desktop Build for StockCeramique...

REM Install desktop tools only
echo Installing Electron and builder tools...
call npm install --save-dev electron@26.0.0 electron-builder@26.0.12 cross-env@7.0.3

REM Quick build without full frontend rebuild (assumes you already built once)
echo Building desktop version...
if not exist "dist-desktop" mkdir dist-desktop
call npx esbuild server/index-desktop.ts --platform=node --packages=external --bundle --format=esm --outdir=dist-desktop

REM Copy required files
xcopy /E /I /Y electron dist-desktop\electron\ 2>nul
copy package-desktop.json dist-desktop\package.json 2>nul

REM Create the Windows executable
echo Creating Windows executable...
cd dist-desktop
call npx electron-builder --config package.json --win --publish=never
cd ..

echo.
echo ======================================
echo DESKTOP BUILD COMPLETE!
echo ======================================
echo.
echo Find your installer at: dist-desktop\dist\StockCeramique Setup.exe
echo.
pause