# 🚀 NUET Prep Academy - Deployment Guide

## Quick Start

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A random secret for NextAuth
   - `NEXTAUTH_URL` - Your production URL
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `RESEND_API_KEY` - Your Resend API key for emails

### Option 2: Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t nuet-prep-academy .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 3: VPS Deployment

1. **Make script executable**:
   ```bash
   chmod +x scripts/deploy-production.sh
   ```

2. **Run deployment**:
   ```bash
   ./scripts/deploy-production.sh
   ```

## Environment Variables

Create a `.env.production` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nuet_prep_academy"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
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
```

## Pre-Deployment Checklist

- [ ] Database is set up and accessible
- [ ] Environment variables are configured
- [ ] Domain is configured (if using custom domain)
- [ ] SSL certificate is set up
- [ ] Email service is configured
- [ ] File uploads directory has proper permissions
- [ ] Backup strategy is in place

## Post-Deployment

1. **Test all functionality**:
   - User registration/login
   - Course enrollment
   - Chat system
   - Admin dashboard
   - Tutor dashboard

2. **Monitor logs**:
   ```bash
   # For PM2
   pm2 logs nuet-prep-academy
   
   # For Docker
   docker logs nuet-prep-academy
   ```

3. **Set up monitoring**:
   - Application performance monitoring
   - Error tracking
   - Uptime monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **NextAuth Issues**:
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure callback URLs are correct

3. **Build Errors**:
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

### Support

For deployment issues, check:
- Application logs
- Database logs
- Server logs
- Network connectivity

## Features Included

✅ **Student Dashboard** - Enhanced with grades and access control
✅ **Tutor Dashboard** - Comprehensive course management
✅ **Admin Dashboard** - Complete platform management
✅ **Chat System** - Real-time messaging with groups
✅ **Mobile Responsive** - Works on all devices
✅ **Authentication** - Secure user management
✅ **Course Management** - Full CRUD operations
✅ **Progress Tracking** - Student performance monitoring
✅ **Gamification** - Points, badges, and leaderboards
✅ **Real-time Updates** - Live chat and notifications

## Production URLs

After deployment, your application will be available at:
- **Vercel**: `https://your-app-name.vercel.app`
- **Custom Domain**: `https://your-domain.com`
- **Docker**: `http://your-server-ip:3000`

---

**🎉 Congratulations! Your NUET Prep Academy is ready for production!**
