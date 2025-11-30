# Quick Start

This guide will help you get Relief Connect up and running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Yarn** 4.x (installed via Corepack)
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (optional, for containerized development)

## Step 1: Clone the Repository

```bash
git clone https://github.com/KavinduUoM20/relief-connect.git
cd relief-connect
```

## Step 2: Enable Corepack

Corepack is included with Node.js 16.9+ and manages Yarn versions:

```bash
corepack enable
```

This enables Yarn 4.x automatically.

## Step 3: Install Dependencies

Install all workspace dependencies:

```bash
yarn install
```

This will install dependencies for:
- Root workspace
- `apps/api` (backend)
- `apps/web` (frontend)
- `libs/shared` (shared library)

## Step 4: Set Up Environment Variables

### Backend Environment (`apps/api/.env`)

Create a `.env` file in the `apps/api` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=relief_connect
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
API_KEY=your_api_key_here
LOGIN_URL=http://localhost:3001/login
```

**Important**: Change the JWT secrets and API key to secure values in production!

### Frontend Environment (`apps/web/.env.local`)

Create a `.env.local` file in the `apps/web` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Map Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Step 5: Set Up PostgreSQL Database

### Option A: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE relief_connect;

# Exit psql
\q
```

### Option B: Using createdb Command

```bash
createdb -U postgres relief_connect
```

### Option C: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name it `relief_connect`
5. Click "Save"

## Step 6: Build Shared Library

The shared library must be built before running the applications:

```bash
yarn shared:build
```

This compiles the shared TypeScript code that both frontend and backend depend on.

## Step 7: Start Development Servers

You'll need two terminal windows - one for the backend and one for the frontend.

### Terminal 1: Backend API

```bash
yarn api:dev
```

The API server will start on **http://localhost:3000**

You should see:
```
✓ Server started successfully
✓ Database connected
✓ Listening on port 3000
```

### Terminal 2: Frontend Web

```bash
yarn web:dev
```

The web application will start on **http://localhost:3001**

You should see:
```
✓ Ready on http://localhost:3001
```

## Step 8: Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3001
- **API Health Check**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api

## Step 9: Create Your First User

### Option A: Via Registration Page

1. Navigate to http://localhost:3001/register
2. Fill in the registration form
3. Submit to create your account

### Option B: Via API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "contactNumber": "+1234567890",
    "role": "ADMIN"
  }'
```

## Step 10: Login

1. Navigate to http://localhost:3001/login
2. Enter your username and password
3. You'll be redirected based on your role:
   - **USER**: Home page
   - **VOLUNTEER_CLUB**: `/clubs/dashboard`
   - **ADMIN**: `/admin/dashboard`

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Backend:**
```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or change PORT in apps/api/.env
PORT=3002
```

**Frontend:**
```bash
# Kill process on port 3001 (Linux/Mac)
lsof -ti:3001 | xargs kill -9

# Or run with different port
yarn web:dev -- -p 3002
```

### Database Connection Error

**Check PostgreSQL is running:**
```bash
# Linux
sudo systemctl status postgresql

# Mac
brew services list | grep postgresql

# Windows
# Check Services panel
```

**Test connection:**
```bash
psql -U postgres -d relief_connect
```

**Verify environment variables:**
- Check `apps/api/.env` has correct database credentials
- Ensure `DB_NAME`, `DB_USER`, `DB_PASSWORD` are correct

### Module Not Found Errors

If you see "Module not found" errors:

```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf libs/*/node_modules
yarn install

# Rebuild shared library
yarn shared:build
```

### TypeScript Errors

If you see TypeScript compilation errors:

```bash
# Rebuild shared library
yarn shared:build

# Check types
yarn type-check
```

### JWT Secret Errors

Ensure you've set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `apps/api/.env`.

## Next Steps

Now that you have the application running:

1. **Explore the Features**:
   - Create a help request at `/need-help`
   - View the map at `/map`
   - Register as a volunteer club
   - Explore the admin dashboard

2. **Read the Documentation**:
   - [Features](02-features.md) - Learn about all features
   - [API Reference](07-api-reference.md) - Understand the API
   - [Development Guide](11-development.md) - Development workflows

3. **Set Up Development Tools**:
   - Install VS Code extensions (ESLint, Prettier, TypeScript)
   - Set up database GUI (pgAdmin, DBeaver)
   - Configure API testing tool (Postman, Insomnia)

## Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [Deployment Guide](10-deployment.md) for detailed Docker setup.

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Database `relief_connect` created
- [ ] Environment variables configured
- [ ] Dependencies installed (`yarn install`)
- [ ] Shared library built (`yarn shared:build`)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can access http://localhost:3001
- [ ] Can access http://localhost:3000/health

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review error messages in terminal output
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure all prerequisites are installed
6. Open an issue on [GitHub](https://github.com/KavinduUoM20/relief-connect/issues)

---

[← Back to README](../README.md) | [Previous: Architecture](04-architecture.md) | [Next: Project Structure →](06-project-structure.md)

