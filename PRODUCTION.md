# 🚀 NUET Prep Academy - Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL database
- Domain name with DNS access
- SSL certificate (Let's Encrypt)

## 🔧 Environment Setup

### 1. Create Production Environment
```bash
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### 2. Update Environment Variables
Edit `.env.production` with your actual values:
- Database credentials
- Supabase configuration
- Kaspi payment keys
- Email service (Resend)
- Domain and SSL settings

## 🐳 Docker Deployment

### 1. Build and Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 3. View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

## 🚀 Traditional Deployment

### 1. Install Dependencies
```bash
npm ci --production
```

### 2. Build Application
```bash
npm run build
```

### 3. Deploy with PM2
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs nuet-prep-academy    # View logs
pm2 restart nuet-prep-academy # Restart app
pm2 stop nuet-prep-academy    # Stop app
```

### Database Backup
```bash
pg_dump -h localhost -U nuet_user nuet_prep_academy > backup.sql
```

### SSL Certificate Renewal
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Database password strong
- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] Regular backups scheduled

## 📈 Performance Optimization

- [ ] CDN configured for static assets
- [ ] Database indexes optimized
- [ ] Redis caching enabled
- [ ] Image optimization enabled
- [ ] Gzip compression active

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and network
2. **SSL Errors**: Verify certificate paths and permissions
3. **Build Failures**: Check Node.js version and dependencies
4. **Memory Issues**: Monitor PM2 memory usage

### Support
- Check application logs
- Verify environment variables
- Test database connectivity
- Review Nginx error logs

## 🎯 Next Steps

1. Set up monitoring (Prometheus/Grafana)
2. Configure automated backups
3. Implement CI/CD pipeline
4. Set up error tracking (Sentry)
5. Configure uptime monitoring
