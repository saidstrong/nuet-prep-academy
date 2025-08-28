#!/bin/bash

echo "🚀 Setting up NUET Prep Academy for Production..."

# Create production environment file
cat > .env.production << EOL
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/nuet_prep_academy"
DIRECT_URL="postgresql://username:password@localhost:5432/nuet_prep_academy"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@nuetprepacademy.com"

# Kaspi Payment Configuration
KASPI_MERCHANT_ID="your-kaspi-merchant-id"
KASPI_API_KEY="your-kaspi-api-key"
KASPI_WEBHOOK_SECRET="your-kaspi-webhook-secret"

# File Upload Configuration
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Analytics Configuration
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"

# Security Configuration
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-32-character-encryption-key"

# Production Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
EOL

echo "✅ Production environment file created!"
echo "📝 Please update .env.production with your actual values"
echo ""
echo "🔧 Next steps:"
echo "1. Update database credentials"
echo "2. Add Supabase configuration"
echo "3. Configure Kaspi payment keys"
echo "4. Set up email service (Resend)"
echo "5. Add analytics IDs"
