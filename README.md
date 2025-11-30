# Relief Connect - Crisis Relief Management Platform

<div align="center">

![Relief Connect](https://img.shields.io/badge/Relief-Connect-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**A comprehensive crisis relief management platform connecting people in need with volunteers, donors, and relief organizations in Sri Lanka.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Development](#-development)
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

---

## ✨ Features

### 🔐 Authentication & User Management

- **Multi-role System**: Support for Users, Volunteer Clubs, Admins, and System Administrators
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control (RBAC)**: Granular permissions based on user roles
- **User Profiles**: Complete user management with status tracking

### 🆘 Help Request Management

- **Location-Based Requests**: GPS-enabled help requests with map visualization
- **Urgency Levels**: Categorize requests as Low, Medium, High, or Critical
- **Multiple Categories**: Food/Water, Rescue, Medical, Shelter, and Other
- **Detailed Information**: Track people count, elders, children, pets, and specific ration items needed
- **Status Tracking**: Monitor request status (OPEN, CLOSED)
- **Contact Options**: Phone, WhatsApp, Email, or No Contact

### 🏕️ Relief Camp Management

- **Camp Registration**: Volunteer clubs can create and manage relief camps
- **Camp Types**: Official and Community camps
- **People Tracking**: Track people count and ranges (1-10, 10-50, 50+)
- **Needs Management**: Track specific needs (Food, Medical, Rescue, Clothes, Children/Elderly)
- **Drop-off Locations**: Designate specific locations for donations
- **Camp Status**: Active/Inactive status tracking

### 💝 Donation System

- **Request-Based Donations**: Donate to specific help requests
- **Ration Item Tracking**: Detailed tracking of donated items (JSON-based)
- **Status Workflow**: 
  - Donor marks as scheduled
  - Donor marks as completed
  - Request owner confirms receipt
- **Donor Information**: Track donor name, contact, and donation history

### 👥 Volunteer Club System

- **Club Registration**: Organizations can register as volunteer clubs
- **Club Dashboard**: Comprehensive dashboard with statistics and management tools
- **Camp Management**: Create and manage multiple relief camps
- **Membership System**: Users can request to join clubs (Pending, Approved, Rejected)
- **Club Profiles**: Detailed club information with contact details

### 🗺️ Interactive Mapping

- **Leaflet Integration**: Interactive maps powered by Leaflet and OpenStreetMap
- **Color-Coded Markers**: Visual indicators for urgency levels and request types
- **Camp Markers**: Distinct markers for relief camps
- **Filtering**: Filter by category, urgency, district, and type
- **Location Picker**: Interactive map-based location selection

### 👨‍💼 Admin Dashboard

- **User Management**: Create, update, and manage all users
- **Volunteer Club Management**: Oversee all volunteer organizations
- **Membership Management**: Approve/reject membership requests
- **System Analytics**: View system-wide statistics and metrics
- **Content Moderation**: Manage help requests and camps

### 🌐 Multi-Language Support

- **i18n Integration**: Full internationalization support
- **Languages**: English, Sinhala (සිංහල), Tamil (தமிழ்)
- **Dynamic Language Switching**: Users can switch languages on the fly

### 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Progressive Enhancement**: Works seamlessly on desktop and tablet
- **Touch-Friendly**: Large buttons and adequate spacing for mobile interaction

---

## 🛠️ Technology Stack

### Frontend (`apps/web`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.0.3 | React framework with SSR/SSG |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.17 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible UI components (Radix UI) |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React Leaflet** | 4.2.1 | React bindings for Leaflet |
| **next-i18next** | 15.2.0 | Internationalization |
| **Lucide React** | 0.555.0 | Icon library |

### Backend (`apps/api`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web framework |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **Sequelize** | 6.35.2 | PostgreSQL ORM |
| **PostgreSQL** | 14+ | Relational database |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcrypt** | 5.1.1 | Password hashing |
| **class-validator** | 0.14.1 | Input validation |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |

### Infrastructure

- **NX Monorepo**: Workspace management and build system
- **Docker**: Containerization for deployment
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancer
- **GitHub Actions**: CI/CD pipelines

---

## 🏗️ Architecture

### Monorepo Structure

```
relief-connect/
├── apps/
│   ├── api/              # Express.js backend API
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── dao/            # Data access objects
│   │   │   ├── models/         # Sequelize models
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   └── config/         # Configuration
│   │   └── package.json
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── pages/          # Next.js pages (routing)
│       │   ├── components/    # React components
│       │   ├── services/       # API service layer
│       │   ├── hooks/          # Custom React hooks
│       │   ├── contexts/       # React contexts (Auth)
│       │   ├── types/          # TypeScript types
│       │   └── lib/            # Utilities
│       └── package.json
│
├── libs/
│   └── shared/           # Shared code
│       └── src/
│           ├── dtos/          # Data Transfer Objects
│           ├── interfaces/    # TypeScript interfaces
│           └── enums/         # Enumerations
│
├── docker-compose.yml    # Docker orchestration
├── nx.json               # NX configuration
└── package.json          # Root package.json
```

### Request Flow

```
User Request
    ↓
Next.js Frontend (Pages Router)
    ↓
API Service Layer (services/*.ts)
    ↓
HTTP Request (fetch/axios)
    ↓
Express.js Backend
    ↓
Middleware (Auth, Validation)
    ↓
Controller (Request Handler)
    ↓
Service (Business Logic)
    ↓
DAO (Data Access)
    ↓
Sequelize ORM
    ↓
PostgreSQL Database
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **Yarn** 4.x (via Corepack)
- **Docker** (optional, for containerized deployment)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KavinduUoM20/relief-connect.git
   cd relief-connect
   ```

2. **Enable Corepack for Yarn**
   ```bash
   corepack enable
   ```

3. **Install dependencies**
   ```bash
   yarn install
   ```

4. **Set up environment variables**

   Create `.env` files in both `apps/api` and `apps/web`:

   **`apps/api/.env`**:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=relief_connect
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # API Configuration
   API_KEY=your_api_key_here
   LOGIN_URL=http://localhost:3001/login
   ```

   **`apps/web/.env.local`**:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Map Configuration
   NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   ```

5. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb relief_connect

   # Or using psql
   psql -U postgres -c "CREATE DATABASE relief_connect;"
   ```

6. **Build shared library**
   ```bash
   yarn shared:build
   ```

7. **Start development servers**

   **Terminal 1 - Backend API:**
   ```bash
   yarn api:dev
   ```
   API will run on http://localhost:3000

   **Terminal 2 - Frontend Web:**
   ```bash
   yarn web:dev
   ```
   Web app will run on http://localhost:3001

8. **Access the application**
   - Frontend: http://localhost:3001
   - API Health: http://localhost:3000/health
   - API Info: http://localhost:3000/api

---

## 📁 Project Structure

### Backend Structure (`apps/api/src`)

```
src/
├── config/              # Configuration files
│   ├── app.config.ts    # App configuration
│   ├── database.ts      # Database connection
│   └── index.ts
│
├── controllers/         # Request handlers
│   ├── auth_controller.ts
│   ├── user_controller.ts
│   ├── help-request_controller.ts
│   ├── camp_controller.ts
│   ├── donation_controller.ts
│   ├── volunteer-club_controller.ts
│   ├── membership_controller.ts
│   └── index.ts
│
├── services/            # Business logic
│   ├── auth_service.ts
│   ├── user_service.ts
│   ├── help-request_service.ts
│   ├── camp_service.ts
│   ├── donation_service.ts
│   ├── volunteer-club_service.ts
│   └── membership_service.ts
│
├── dao/                 # Data access layer
│   ├── user_dao.ts
│   ├── help-request_dao.ts
│   ├── camp_dao.ts
│   ├── donation_dao.ts
│   └── ...
│
├── models/              # Sequelize models
│   ├── user.model.ts
│   ├── help-request.model.ts
│   ├── camp.model.ts
│   ├── donation.model.ts
│   ├── volunteer-club.model.ts
│   └── ...
│
├── routes/              # API routes
│   ├── auth/
│   ├── user/
│   ├── help-request/
│   ├── camp/
│   ├── donation/
│   ├── volunteer-club/
│   ├── membership/
│   └── admin/
│
├── middleware/          # Express middleware
│   ├── authentication.ts
│   ├── authorization.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── responseHandler.ts
│
├── utils/               # Utility functions
│   ├── jwt.util.ts
│   └── password.util.ts
│
├── main.ts              # Application entry point
└── server.ts            # Server setup
```

### Frontend Structure (`apps/web/src`)

```
src/
├── pages/               # Next.js pages (file-based routing)
│   ├── _app.tsx        # App wrapper
│   ├── index.tsx       # Home page
│   ├── login.tsx        # Login page
│   ├── register.tsx    # Registration
│   ├── map.tsx         # Interactive map
│   ├── need-help.tsx   # Create help request
│   ├── donate.tsx      # Donation page
│   ├── my-requests.tsx # User's requests
│   ├── clubs/          # Volunteer club pages
│   │   ├── index.tsx
│   │   ├── dashboard.tsx
│   │   ├── my-club.tsx
│   │   └── [id].tsx
│   ├── camps/          # Camp pages
│   │   └── [id].tsx
│   ├── admin/          # Admin pages
│   │   ├── dashboard.tsx
│   │   ├── users.tsx
│   │   └── volunteer-clubs.tsx
│   └── ...
│
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── LandingPage.tsx
│   ├── Map.tsx
│   ├── HelpRequestForm.tsx
│   ├── CampForm.tsx
│   ├── DonationForm.tsx
│   └── ...
│
├── services/           # API service layer
│   ├── api-client.ts
│   ├── help-request-service.ts
│   ├── camp-service.ts
│   ├── donation-service.ts
│   ├── volunteer-club-service.ts
│   └── ...
│
├── hooks/              # Custom React hooks
│   └── useAuth.ts
│
├── contexts/           # React contexts
│   └── AuthContext.tsx
│
├── types/              # TypeScript types
│   ├── user.ts
│   ├── help-request.ts
│   ├── camp.ts
│   └── ...
│
└── lib/                # Utilities
    └── utils.ts
```

---

## 🔌 API Reference

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |

#### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users/me` | Get current user | Yes | All |
| GET | `/api/users` | Get all users | Yes | ADMIN |
| GET | `/api/users/:id` | Get user by ID | Yes | ADMIN |
| PUT | `/api/users/:id` | Update user | Yes | ADMIN |
| DELETE | `/api/users/:id` | Delete user | Yes | ADMIN |

#### Help Requests (`/api/help-requests`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/help-requests` | Get all help requests | No | - |
| GET | `/api/help-requests/:id` | Get help request by ID | No | - |
| POST | `/api/help-requests` | Create help request | Optional | USER |
| PUT | `/api/help-requests/:id` | Update help request | Yes | Owner/ADMIN |
| DELETE | `/api/help-requests/:id` | Delete help request | Yes | Owner/ADMIN |

#### Camps (`/api/camps`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/camps` | Get all camps | No | - |
| GET | `/api/camps/:id` | Get camp by ID | No | - |
| POST | `/api/camps` | Create camp | Yes | VOLUNTEER_CLUB |
| PUT | `/api/camps/:id` | Update camp | Yes | Owner/ADMIN |
| DELETE | `/api/camps/:id` | Delete camp | Yes | Owner/ADMIN |

#### Donations (`/api/donations`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/donations` | Get all donations | Yes | ADMIN |
| GET | `/api/donations/help-request/:id` | Get donations for request | No | - |
| POST | `/api/donations` | Create donation | Yes | USER |
| PUT | `/api/donations/:id` | Update donation | Yes | Owner/ADMIN |

#### Volunteer Clubs (`/api/volunteer-clubs`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/volunteer-clubs` | Get all clubs | No | - |
| GET | `/api/volunteer-clubs/:id` | Get club by ID | No | - |
| GET | `/api/volunteer-clubs/me` | Get my club | Yes | VOLUNTEER_CLUB |
| POST | `/api/volunteer-clubs` | Create club | Yes | ADMIN |
| PUT | `/api/volunteer-clubs/:id` | Update club | Yes | Owner/ADMIN |

#### Memberships (`/api/memberships`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/memberships` | Get all memberships | Yes | ADMIN |
| GET | `/api/memberships/me` | Get my memberships | Yes | USER |
| POST | `/api/memberships` | Request membership | Yes | USER |
| PUT | `/api/memberships/:id` | Update membership | Yes | Club Owner/ADMIN |

#### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/admin/stats` | Get system statistics | Yes | ADMIN |
| GET | `/api/admin/users` | Get all users | Yes | ADMIN |
| GET | `/api/admin/volunteer-clubs` | Get all clubs | Yes | ADMIN |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## 🔐 Authentication & Authorization

### User Roles

1. **USER** - Regular users who can:
   - Create help requests
   - Make donations
   - Request to join volunteer clubs
   - View their own requests and donations

2. **VOLUNTEER_CLUB** - Volunteer organizations that can:
   - Manage their club profile
   - Create and manage relief camps
   - View dashboard with statistics
   - Approve/reject membership requests
   - Manage camp donations

3. **ADMIN** - Administrators who can:
   - Manage all users
   - Manage volunteer clubs
   - Manage memberships
   - View system statistics
   - Moderate content

4. **SYSTEM_ADMINISTRATOR** - System administrators with full access

### Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT access token and refresh token
3. Client stores tokens (typically in localStorage)
4. Client includes token in `Authorization: Bearer <token>` header for authenticated requests
5. Server validates token via authentication middleware
6. Authorization middleware checks user role for protected routes
7. Refresh token used to obtain new access token when expired

### Protected Routes

Routes can be protected using middleware:

```typescript
// Require authentication only
router.get('/protected', authenticate, handler);

// Require specific role
router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), handler);

// Require multiple roles
router.get('/club-or-admin', authenticate, 
  authorize(UserRole.VOLUNTEER_CLUB, UserRole.ADMIN), handler);
```

---

## 🗄️ Database Schema

### Core Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| username | VARCHAR(50) | Unique username |
| password | VARCHAR(255) | Hashed password (optional) |
| contactNumber | VARCHAR(50) | Contact number |
| role | VARCHAR(20) | User role (USER, VOLUNTEER_CLUB, ADMIN, SYSTEM_ADMINISTRATOR) |
| status | VARCHAR(20) | User status (ACTIVE, INACTIVE) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

#### `volunteer_clubs`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(255) | Club name (unique) |
| description | TEXT | Club description |
| contactNumber | VARCHAR(50) | Contact number |
| email | VARCHAR(255) | Email address |
| address | VARCHAR(500) | Physical address |
| userId | INTEGER | Foreign key to users |
| status | VARCHAR(20) | Status (ACTIVE, INACTIVE) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

#### `help_requests`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| userId | INTEGER | Foreign key to users (optional) |
| lat | DECIMAL(10,8) | Latitude |
| lng | DECIMAL(11,8) | Longitude |
| urgency | VARCHAR(20) | Urgency level (LOW, MEDIUM, HIGH, CRITICAL) |
| shortNote | VARCHAR(160) | Short description |
| approxArea | VARCHAR(255) | Approximate location |
| contactType | VARCHAR(20) | Contact type (PHONE, WHATSAPP, EMAIL, NONE) |
| contact | VARCHAR(50) | Contact information |
| name | VARCHAR(100) | Requester name |
| totalPeople | INTEGER | Total people count |
| elders | INTEGER | Number of elders |
| children | INTEGER | Number of children |
| pets | INTEGER | Number of pets |
| rationItems | TEXT[] | Array of ration items |
| status | VARCHAR(20) | Status (OPEN, CLOSED) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

#### `camps`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| lat | DECIMAL(10,8) | Latitude |
| lng | DECIMAL(11,8) | Longitude |
| campType | VARCHAR(50) | Camp type (OFFICIAL, COMMUNITY) |
| name | VARCHAR(255) | Camp name |
| peopleRange | VARCHAR(20) | People range (1-10, 10-50, 50+) |
| needs | TEXT[] | Array of needs |
| shortNote | VARCHAR(500) | Short description |
| contactType | VARCHAR(20) | Contact type |
| contact | VARCHAR(50) | Contact information |
| volunteerClubId | INTEGER | Foreign key to volunteer_clubs |
| peopleCount | INTEGER | Actual people count |
| description | TEXT | Full description |
| location | VARCHAR(500) | Location description |
| status | VARCHAR(20) | Status (ACTIVE, INACTIVE) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

#### `donations`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| helpRequestId | INTEGER | Foreign key to help_requests |
| donatorId | INTEGER | Foreign key to users |
| donatorName | VARCHAR(100) | Donor name |
| donatorMobileNumber | VARCHAR(20) | Donor mobile number |
| rationItems | JSONB | Donated items (key-value pairs) |
| donatorMarkedScheduled | BOOLEAN | Donor marked as scheduled |
| donatorMarkedCompleted | BOOLEAN | Donor marked as completed |
| ownerMarkedCompleted | BOOLEAN | Owner confirmed receipt |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

#### `user_volunteer_club_memberships`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| userId | INTEGER | Foreign key to users |
| volunteerClubId | INTEGER | Foreign key to volunteer_clubs |
| status | VARCHAR(20) | Status (PENDING, APPROVED, REJECTED) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Update timestamp |

---

## 🚢 Deployment

### Docker Deployment

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

### Environment-Specific Deployments

The project includes Docker Compose files for different environments:

- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development
- `docker-compose.qa.yml` - QA environment
- `docker-compose.staging.yml` - Staging
- `docker-compose.prod.yml` - Production

### CI/CD

GitHub Actions workflows are configured for:

- **CI**: Automated testing and linting on PRs
- **CD**: Automated deployment to different environments
- **Environments**: dev, qa, staging, production

See `.github/workflows/` for detailed configuration.

---

## 💻 Development

### Available Scripts

#### Root Level
```bash
# Install dependencies
yarn install

# Build all workspaces
yarn build:all

# Type checking
yarn type-check

# Docker commands
yarn docker:build
yarn docker:up
yarn docker:down
yarn docker:logs
```

#### Backend API (`apps/api`)
```bash
# Development server
yarn api:dev

# Build
yarn api:build

# Start production
yarn api:start

# Lint
yarn api:lint
```

#### Frontend Web (`apps/web`)
```bash
# Development server (port 3001)
yarn web:dev

# Build
yarn web:build

# Start production
yarn web:start

# Type check
yarn web:type-check
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for both API and Web
- **Prettier**: Code formatting (if configured)

### Testing

```bash
# Run tests (when implemented)
yarn test

# Run tests with coverage
yarn test:coverage
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Ensure all tests pass
- Follow the existing code style

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for crisis relief coordination
- Inspired by the need for efficient disaster response systems
- Thanks to all contributors and volunteers

---

## 📚 Additional Resources

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
