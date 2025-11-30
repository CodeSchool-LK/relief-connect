# Deployment

This guide covers deploying Relief Connect to production environments.

## Deployment Options

### 1. Docker Compose (Recommended)
Easiest deployment method using Docker containers.

### 2. Manual Deployment
Deploy directly to a VPS/server without Docker.

### 3. Cloud Platforms
Deploy to cloud platforms (AWS, Azure, GCP, etc.).

---

## Docker Compose Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB RAM
- 10GB free disk space

### Step 1: Clone Repository

```bash
git clone https://github.com/KavinduUoM20/relief-connect.git
cd relief-connect
```

### Step 2: Configure Environment

Create environment files:

**`apps/api/.env`:**
```env
NODE_ENV=production
PORT=3000

DB_HOST=postgres
DB_PORT=5432
DB_NAME=relief_connect
DB_USER=postgres
DB_PASSWORD=your_secure_password

JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

API_KEY=your_production_api_key
LOGIN_URL=https://yourdomain.com/login
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://api:3000
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Step 3: Build and Start

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Initialize Database

```bash
# Run migrations (if using Sequelize migrations)
docker-compose -f docker-compose.prod.yml exec api npm run migrate

# Seed initial data (optional)
docker-compose -f docker-compose.prod.yml exec api npm run seed
```

### Step 5: Verify Deployment

- Frontend: http://your-server-ip
- API Health: http://your-server-ip/health
- API: http://your-server-ip/api

---

## Manual VPS Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (process manager)
- Git

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Yarn
corepack enable
```

### Step 2: Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE relief_connect;
CREATE USER relief_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE relief_connect TO relief_user;
\q
```

### Step 3: Clone and Build

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/KavinduUoM20/relief-connect.git
cd relief-connect
sudo chown -R $USER:$USER .

# Install dependencies
yarn install

# Build shared library
yarn shared:build

# Build backend
yarn api:build

# Build frontend
yarn web:build
```

### Step 4: Configure Environment

Set up environment variables (see Docker section above).

### Step 5: Start Services with PM2

```bash
# Start API
cd apps/api
pm2 start dist/main.js --name relief-api

# Start Web (if not using static export)
cd ../web
pm2 start npm --name relief-web -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 6: Configure Nginx

Create `/etc/nginx/sites-available/relief-connect`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/relief-connect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

Update Nginx config to redirect HTTP to HTTPS.

---

## Environment-Specific Deployments

### Development Environment

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### QA Environment

```bash
docker-compose -f docker-compose.qa.yml up -d
```

### Staging Environment

```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production Environment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## CI/CD with GitHub Actions

The project includes GitHub Actions workflows for automated deployment.

### Workflow Files

- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd-dev.yml` - Development deployment
- `.github/workflows/cd-qa.yml` - QA deployment
- `.github/workflows/cd-staging.yml` - Staging deployment
- `.github/workflows/cd-prod.yml` - Production deployment

### Required Secrets

Configure these secrets in GitHub:

- `VPS_HOST` - Server IP or domain
- `VPS_USERNAME` - SSH username
- `VPS_SSH_KEY` - SSH private key
- `VPS_PORT` - SSH port (default: 22)

### Deployment Process

1. Push to branch triggers workflow
2. Workflow builds Docker images
3. Images pushed to registry (if configured)
4. SSH into server
5. Pull latest code
6. Rebuild and restart containers
7. Health check verification

---

## Database Migrations

### Running Migrations

```bash
# Using Sequelize CLI
cd apps/api
npx sequelize-cli db:migrate

# Or using npm script
npm run migrate
```

### Rollback Migrations

```bash
npx sequelize-cli db:migrate:undo
```

---

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump -U postgres relief_connect > backup_$(date +%Y%m%d).sql

# Automated backup script
./scripts/backup.sh
```

### Restore Database

```bash
# Restore from backup
psql -U postgres relief_connect < backup_20240101.sql
```

### Application Backup

```bash
# Backup entire application
tar -czf relief-connect-backup-$(date +%Y%m%d).tar.gz \
  /var/www/relief-connect \
  /var/lib/postgresql/data
```

---

## Monitoring and Logs

### View Logs

```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f web

# PM2 logs
pm2 logs relief-api
pm2 logs relief-web

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# API readiness
curl http://localhost:3000/health/ready
```

### Monitoring Tools

- **PM2 Monitoring**: `pm2 monit`
- **Docker Stats**: `docker stats`
- **System Resources**: `htop`, `df -h`

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple API Instances**: Run multiple API containers
3. **Database Replication**: Set up PostgreSQL replication
4. **CDN**: Use CDN for static assets

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add caching layer (Redis)
4. Use connection pooling

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Set up rate limiting
- [ ] Enable CORS for specific origins
- [ ] Regular security updates
- [ ] Database backups encrypted
- [ ] Environment variables secured
- [ ] API keys rotated regularly

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues

```bash
# Test connection
psql -U postgres -d relief_connect

# Check PostgreSQL status
sudo systemctl status postgresql

# Verify environment variables
cat apps/api/.env | grep DB_
```

### Port Conflicts

```bash
# Check port usage
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Increase swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Rollback Procedure

### Using Scripts

```bash
# Rollback to previous version
./scripts/rollback.sh
```

### Manual Rollback

```bash
# Stop services
docker-compose down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose build
docker-compose up -d
```

---

## Performance Optimization

### Frontend

- Enable Next.js static export (if applicable)
- Use CDN for static assets
- Enable gzip compression
- Optimize images
- Code splitting

### Backend

- Enable connection pooling
- Add Redis caching
- Optimize database queries
- Use database indexes
- Enable response compression

### Database

- Regular VACUUM and ANALYZE
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas (if needed)

---

[← Back to README](../README.md) | [Previous: Database Schema](09-database-schema.md) | [Next: Development →](11-development.md)

