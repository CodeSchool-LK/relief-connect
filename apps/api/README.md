# Relief Connect API

Express.js backend API for the Relief Connect platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Yarn 4.x (via Corepack)

### Installation

```bash
# From project root
yarn install

# Build shared library first
yarn shared:build

# Install API dependencies
cd apps/api
yarn install
```

### Environment Setup

Create a `.env` file in `apps/api/`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=relief_connect
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
API_KEY=your_api_key
LOGIN_URL=http://localhost:3001/login
```

### Database Setup

```bash
# Create database
createdb -U postgres relief_connect

# Or using psql
psql -U postgres -c "CREATE DATABASE relief_connect;"
```

### Running

```bash
# Development (with hot reload)
yarn dev

# Production build
yarn build

# Production start
yarn start
```

The API will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── dao/            # Data access objects
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routes
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   ├── main.ts         # Entry point
│   └── server.ts       # Server setup
├── dist/               # Compiled output
├── Dockerfile          # Docker configuration
└── package.json        # Dependencies
```

---

## 🔌 API Endpoints

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

### Main Endpoints

- **Health**: `GET /health`
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Users**: `GET /api/users/me`, `GET /api/users`
- **Help Requests**: `GET /api/help-requests`, `POST /api/help-requests`
- **Camps**: `GET /api/camps`, `POST /api/camps`
- **Donations**: `GET /api/donations`, `POST /api/donations`
- **Volunteer Clubs**: `GET /api/volunteer-clubs`
- **Memberships**: `GET /api/memberships`, `POST /api/memberships`
- **Admin**: `GET /api/admin/stats`

📖 **[Full API Reference →](../../docs/07-api-reference.md)**

---

## 🏗️ Architecture

### Layered Architecture

```
Routes → Middleware → Controllers → Services → DAOs → Models → Database
```

### Request Flow

1. HTTP Request arrives
2. Express Router matches route
3. Middleware stack executes (CORS, Auth, Validation)
4. Controller handles request
5. Service contains business logic
6. DAO accesses database
7. Response returned

📖 **[Full Architecture Docs →](../../docs/04-architecture.md)**

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

```bash
POST /api/auth/login
{
  "username": "user",
  "password": "password"
}
```

### Using a Token

Include in request headers:
```
Authorization: Bearer <access_token>
```

📖 **[Full Auth Docs →](../../docs/08-authentication-authorization.md)**

---

## 🗄️ Database

### Models

- `User` - User accounts
- `VolunteerClub` - Volunteer organizations
- `HelpRequest` - Help requests
- `Camp` - Relief camps
- `Donation` - Donations
- `Membership` - User-club memberships
- `RefreshToken` - JWT refresh tokens
- `Item` - Ration items catalog

### Migrations

```bash
# Create migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

📖 **[Full Database Schema →](../../docs/09-database-schema.md)**

---

## 🛠️ Development

### Available Scripts

```bash
yarn dev          # Development server with hot reload
yarn build        # Build TypeScript to JavaScript
yarn start        # Start production server
yarn lint         # Run ESLint
yarn lint:fix     # Fix linting issues
```

### Code Style

- TypeScript strict mode
- ESLint for linting
- Controllers handle HTTP only
- Services contain business logic
- DAOs handle data access

📖 **[Full Development Guide →](../../docs/11-development.md)**

---

## 🧪 Testing

```bash
# Run tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:coverage
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t relief-connect-api .
```

### Run Container

```bash
docker run -p 3000:3000 --env-file .env relief-connect-api
```

---

## 📚 Documentation

- **[API Reference](../../docs/07-api-reference.md)** - Complete endpoint documentation
- **[Architecture](../../docs/04-architecture.md)** - System architecture
- **[Database Schema](../../docs/09-database-schema.md)** - Database structure
- **[Authentication](../../docs/08-authentication-authorization.md)** - Auth system
- **[Development Guide](../../docs/11-development.md)** - Development workflows

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `DB_HOST` | Database host | Yes |
| `DB_PORT` | Database port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `API_KEY` | API key for authentication | Yes |

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d relief_connect
```

### Port Already in Use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Rebuild shared library
cd ../..
yarn shared:build

# Reinstall dependencies
yarn install
```

---

## 📝 License

MIT License - see [LICENSE](../../LICENSE) file.

---

[← Back to Project Root](../../README.md) | [Full Documentation →](../../docs/README.md)

