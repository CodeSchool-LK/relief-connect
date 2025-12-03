# Relief Connect - Crisis Relief Management Platform

<div align="center">

![Relief Connect](https://img.shields.io/badge/Relief-Connect-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**An open-source crisis relief management platform connecting people in need with volunteers, donors, and relief organizations.**

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Testing Credentials](#-testing-credentials-development-environment)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Relief Connect** is a full-stack crisis relief management platform designed to coordinate emergency assistance during natural disasters and crises. The platform enables:

- **Individuals** to request help with location-based needs
- **Volunteer Organizations** to manage relief camps and coordinate efforts
- **Donors** to contribute resources to specific requests
- **Administrators** to oversee and manage the entire system

Built with modern technologies and best practices, Relief Connect provides a scalable, secure, and user-friendly solution for crisis management.

📖 **[Read Full Overview →](docs/01-overview.md)**

---

## ✨ Features

### Core Features

- 🔐 **Multi-Role Authentication** - Users, Volunteer Clubs, Admins with JWT-based security
- 🆘 **Help Request Management** - Location-based requests with urgency levels and categories
- 🏕️ **Relief Camp Management** - Volunteer clubs can create and manage relief camps
- 💝 **Donation System** - Track donations with status workflow
- 👥 **Volunteer Club System** - Organizations can register and manage memberships
- 🗺️ **Interactive Mapping** - Leaflet maps with color-coded markers and filtering
- 👨‍💼 **Admin Dashboard** - Comprehensive system management and analytics
- 🌐 **Multi-Language Support** - English, Sinhala, and Tamil

📖 **[Read Full Features →](docs/02-features.md)**

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **Leaflet** - Interactive maps

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **TypeScript** - Type-safe backend

### Infrastructure
- **NX Monorepo** - Workspace management
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

📖 **[Read Full Tech Stack →](docs/03-technology-stack.md)**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher (only if running backend locally)
- Yarn 4.x (via Corepack)

### Installation

```bash
# Clone repository
git clone https://github.com/CodeSchool-LK/relief-connect.git
cd relief-connect

# Enable Corepack
corepack enable

# Install dependencies
yarn install

# Build shared library
yarn shared:build
```

### Quick Start Options

#### Option 1: Frontend Only (Recommended for Quick Testing)

Use the deployed development API - **no backend setup required!**

1. **Set up Frontend Environment** (`apps/web/.env.local`):
```env
# Use the deployed dev API
NEXT_PUBLIC_API_URL=https://dev-api.pasindusampath.com

# Map Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

2. **Start Frontend Only**:
```bash
yarn web:dev    # Frontend on port 3001
```

Access the application:
- **Frontend**: http://localhost:3001
- **API**: Uses https://dev-api.pasindusampath.com (no local backend needed)

#### Option 2: Full Local Development

Run both frontend and backend locally:

1. **Set up Backend Environment** (`apps/api/.env`):
   - Copy `apps/api/env.example` to `apps/api/.env`
   - Configure PostgreSQL credentials as shown in `env.example`:
     - `DB_HOST=localhost`
     - `DB_PORT=5432`
     - `DB_NAME=nx_monorepo_dev`
     - `DB_USER=postgres`
     - `DB_PASSWORD=postgres` (or your PostgreSQL password)
   - Set JWT secrets and other required variables

2. **Set up Frontend Environment** (`apps/web/.env.local`):
```env
# Use local API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Map Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

3. **Start Development Servers**:
```bash
yarn api:dev    # Terminal 1 - Backend on port 3000
yarn web:dev    # Terminal 2 - Frontend on port 3001
```

Access the application:
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

📖 **[Read Full Quick Start Guide →](docs/05-quick-start.md)**

---

## 🧪 Testing Credentials (Development Environment)

### Development URLs

- **Frontend**: [https://dev-web.pasindusampath.com/](https://dev-web.pasindusampath.com/)
- **Backend API**: [https://dev-api.pasindusampath.com/](https://dev-api.pasindusampath.com/)

### Admin Login (Dev Environment Only)

- **Username:** `pasindusampath`
- **Password:** `77889900`

### Volunteer Club Login

- **Username:** `test-club`
- **Password:** `123456789`

### Normal Users

- No password required
- Users can log in using **only their unique username**

### Creating New Volunteer Accounts

- You can create additional volunteer club accounts through the **Admin Panel**

> **Tip:** To test the application without running a local backend, set `NEXT_PUBLIC_API_URL=https://dev-api.pasindusampath.com` in your `apps/web/.env.local` file and run only the frontend with `yarn web:dev`.

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

| Document | Description |
|----------|-------------|
| [Overview](docs/01-overview.md) | Project purpose, goals, and vision |
| [Features](docs/02-features.md) | Detailed feature breakdown |
| [Technology Stack](docs/03-technology-stack.md) | Complete tech stack with versions |
| [Architecture](docs/04-architecture.md) | System architecture and design patterns |
| [Quick Start](docs/05-quick-start.md) | Step-by-step setup instructions |
| [Project Structure](docs/06-project-structure.md) | Directory structure and organization |
| [API Reference](docs/07-api-reference.md) | Complete API endpoint documentation |
| [Authentication & Authorization](docs/08-authentication-authorization.md) | Auth system and RBAC |
| [Database Schema](docs/09-database-schema.md) | Database tables and relationships |
| [Deployment](docs/10-deployment.md) | Production deployment guide |
| [Development](docs/11-development.md) | Development workflows and guidelines |
| [Contributing](docs/12-contributing.md) | Contribution guidelines |

---

## 🏗️ Project Structure

```
relief-connect/
├── apps/
│   ├── api/              # Express.js Backend
│   └── web/              # Next.js Frontend
├── libs/
│   └── shared/           # Shared code library
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── package.json           # Root package.json
```

📖 **[Read Full Project Structure →](docs/06-project-structure.md)**

---

## 🔌 API Reference

### Base URL
- **Local Development**: `http://localhost:3000`
- **Dev Environment**: `https://dev-api.pasindusampath.com`
- **Production**: `https://api.yourdomain.com`

### Key Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/help-requests` - Get all help requests
- `POST /api/help-requests` - Create help request
- `GET /api/camps` - Get all relief camps
- `POST /api/camps` - Create camp (Volunteer Club)
- `GET /api/volunteer-clubs` - Get all volunteer clubs
- `GET /api/admin/stats` - System statistics (Admin)

📖 **[Read Full API Reference →](docs/07-api-reference.md)**

1. **Build Docker images**
   ```bash
   docker-compose build
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

We welcome contributions! Please see our [Contributing Guide](docs/12-contributing.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit following [Conventional Commits](https://www.conventionalcommits.org/)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

📖 **[Read Full Contributing Guide →](docs/12-contributing.md)**

The project includes Docker Compose files for different environments:

- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development
- `docker-compose.qa.yml` - QA environment
- `docker-compose.staging.yml` - Staging
- `docker-compose.prod.yml` - Production

### CI/CD

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/KavinduUoM20/relief-connect/issues)
- **Documentation**: See [`docs/`](docs/) directory
- **Questions**: Open a discussion on GitHub

---

## 🙏 Acknowledgments

- Built with ❤️ for crisis relief coordination
- Inspired by the need for efficient disaster response systems
- Thanks to all contributors and volunteers

---

## 🤝 Contributing

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [NX Documentation](https://nx.dev/)

---

<div align="center">

**Built with ❤️ to help connect people in need with those who can help**

[⬆ Back to Top](#relief-connect---crisis-relief-management-platform)

</div>
