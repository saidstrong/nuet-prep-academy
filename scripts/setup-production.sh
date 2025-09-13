#!/bin/bash

echo "🚀 Setting up NUET Prep Academy for Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production file..."
    cat > .env.production << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nuet_prep_academy"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Stripe (Optional)
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# WebSocket (Optional)
WS_URL="wss://your-domain.com"

# Production
NODE_ENV="production"
EOF
    echo "✅ .env.production file created!"
    echo "⚠️  Please update the environment variables in .env.production with your actual values."
else
    echo "✅ .env.production file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client."
    exit 1
fi

echo "✅ Prisma client generated!"

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads/avatars
mkdir -p public/uploads/courses
mkdir -p public/uploads/materials

# Set proper permissions
chmod 755 public/uploads
chmod 755 public/uploads/avatars
chmod 755 public/uploads/courses
chmod 755 public/uploads/materials

echo "✅ Uploads directory created with proper permissions!"

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nuet-prep-academy',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

echo "✅ PM2 ecosystem file created!"

# Create nginx configuration
echo "🌐 Creating nginx configuration..."
cat > nginx/nuetsite.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (update with your certificate paths)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Uploads
    location /uploads {
        alias /path/to/your/app/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "✅ Nginx configuration created!"

echo ""
echo "🎉 Production setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.production with your actual values"
echo "2. Set up your database and run migrations"
echo "3. Configure your domain and SSL certificates"
echo "4. Update nginx configuration with your domain and certificate paths"
echo "5. Run ./scripts/deploy-production.sh to deploy"
echo ""
echo "🔧 Manual steps required:"
echo "- Set up PostgreSQL database"
echo "- Configure Supabase project"
echo "- Set up Resend for emails"
echo "- Configure Stripe (if using payments)"
echo "- Set up SSL certificates"
echo "- Configure domain DNS"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"