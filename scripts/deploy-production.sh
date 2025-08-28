#!/bin/bash

echo "🚀 Deploying NUET Prep Academy to Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found. Please run setup-production.sh first."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed. Please check your database connection."
    exit 1
fi

echo "✅ Database migrations completed!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed."
    exit 1
fi

echo "✅ Prisma client generated!"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
pm2 stop nuet-prep-academy 2>/dev/null || true
pm2 delete nuet-prep-academy 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start npm --name "nuet-prep-academy" -- start

if [ $? -ne 0 ]; then
    echo "❌ Failed to start application with PM2."
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo "✅ Application deployed successfully!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 View logs with: pm2 logs nuet-prep-academy"
echo "🛑 Stop with: pm2 stop nuet-prep-academy"
echo "🔄 Restart with: pm2 restart nuet-prep-academy"
echo ""
echo "🌐 Your application should now be running!"
echo "📝 Check the logs for any startup issues."
