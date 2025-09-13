@echo off
echo 🚀 Quick Deploy - NUET Prep Academy
echo.

echo 📦 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build completed!
echo.

echo 🚀 Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next steps:
echo 1. Set up environment variables in Vercel dashboard
echo 2. Configure your database
echo 3. Test your application
echo.
pause

