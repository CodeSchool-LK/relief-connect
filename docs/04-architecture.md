# Architecture

## Monorepo Structure

Relief Connect is organized as an NX monorepo, allowing code sharing and unified dependency management.

```
relief-connect/
├── apps/
│   ├── api/              # Express.js Backend API
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers (MVC pattern)
│   │   │   ├── services/       # Business logic layer
│   │   │   ├── dao/            # Data Access Objects
│   │   │   ├── models/         # Sequelize database models
│   │   │   ├── routes/         # Express route definitions
│   │   │   ├── middleware/     # Express middleware (auth, validation, etc.)
│   │   │   ├── config/         # Configuration files
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── main.ts         # Application entry point
│   │   │   └── server.ts       # Server setup and configuration
│   │   └── package.json
│   │
│   └── web/              # Next.js Frontend Application
│       ├── src/
│       │   ├── pages/          # Next.js pages (file-based routing)
│       │   ├── components/     # React components
│       │   ├── services/       # API service layer
│       │   ├── hooks/          # Custom React hooks
│       │   ├── contexts/       # React Context providers
│       │   ├── types/          # TypeScript type definitions
│       │   ├── lib/            # Utility functions
│       │   └── styles/         # CSS and styling files
│       └── package.json
│
├── libs/
│   └── shared/           # Shared Code Library
│       └── src/
│           ├── dtos/          # Data Transfer Objects
│           ├── interfaces/    # TypeScript interfaces
│           └── enums/         # Enumerations
│
├── docker-compose.yml     # Docker orchestration
├── nx.json                # NX configuration
└── package.json           # Root package.json
```

---

## Backend Architecture

### Layered Architecture

The backend follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← HTTP endpoints, route definitions
├─────────────────────────────────────┤
│      Middleware Layer               │  ← Authentication, validation, error handling
├─────────────────────────────────────┤
│      Controllers Layer               │  ← Request/response handling
├─────────────────────────────────────┤
│       Services Layer                 │  ← Business logic
├─────────────────────────────────────┤
│         DAO Layer                   │  ← Data access abstraction
├─────────────────────────────────────┤
│        Models Layer                  │  ← Database models (Sequelize)
├─────────────────────────────────────┤
│      Database (PostgreSQL)          │  ← Data persistence
└─────────────────────────────────────┘
```

### Request Flow

```
1. HTTP Request
   ↓
2. Express Router
   ↓
3. Middleware Stack
   ├── CORS
   ├── Helmet (Security)
   ├── Morgan (Logging)
   ├── Body Parser
   ├── Authentication Middleware
   └── Authorization Middleware
   ↓
4. Route Handler (Controller)
   ↓
5. Validation (class-validator)
   ↓
6. Service Layer (Business Logic)
   ↓
7. DAO Layer (Data Access)
   ↓
8. Sequelize ORM
   ↓
9. PostgreSQL Database
   ↓
10. Response (JSON)
```

### Directory Structure

```
apps/api/src/
├── config/              # Configuration
│   ├── app.config.ts    # Application configuration
│   └── database.ts      # Database connection setup
│
├── controllers/         # Request handlers
│   ├── auth_controller.ts
│   ├── user_controller.ts
│   ├── help-request_controller.ts
│   └── ...
│
├── services/            # Business logic
│   ├── auth_service.ts
│   ├── user_service.ts
│   └── ...
│
├── dao/                 # Data Access Objects
│   ├── user_dao.ts
│   ├── help-request_dao.ts
│   └── ...
│
├── models/              # Sequelize models
│   ├── user.model.ts
│   ├── help-request.model.ts
│   └── ...
│
├── routes/              # Route definitions
│   ├── auth/
│   ├── user/
│   └── ...
│
├── middleware/          # Express middleware
│   ├── authentication.ts
│   ├── authorization.ts
│   ├── validation.ts
│   └── errorHandler.ts
│
└── utils/               # Utilities
    ├── jwt.util.ts
    └── password.util.ts
```

---

## Frontend Architecture

### Component Architecture

```
┌─────────────────────────────────────┐
│         Pages (Next.js)             │  ← File-based routing
├─────────────────────────────────────┤
│      Components (React)             │  ← Reusable UI components
├─────────────────────────────────────┤
│      Services Layer                 │  ← API communication
├─────────────────────────────────────┤
│      Contexts (React Context)       │  ← Global state (Auth)
├─────────────────────────────────────┤
│      Hooks (Custom Hooks)           │  ← Reusable logic
├─────────────────────────────────────┤
│      Types (TypeScript)             │  ← Type definitions
└─────────────────────────────────────┘
```

### Request Flow

```
1. User Interaction (Click, Form Submit)
   ↓
2. React Component Event Handler
   ↓
3. Service Layer Call
   ├── api-client.ts (HTTP client)
   └── Service-specific methods
   ↓
4. HTTP Request (fetch/axios)
   ↓
5. Express.js Backend API
   ↓
6. Response Handling
   ↓
7. State Update (useState, Context)
   ↓
8. UI Re-render
```

### Directory Structure

```
apps/web/src/
├── pages/               # Next.js pages
│   ├── _app.tsx         # App wrapper
│   ├── index.tsx        # Home page
│   ├── login.tsx
│   ├── clubs/
│   │   ├── dashboard.tsx
│   │   └── ...
│   └── ...
│
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── LandingPage.tsx
│   ├── Map.tsx
│   └── ...
│
├── services/           # API services
│   ├── api-client.ts
│   ├── help-request-service.ts
│   └── ...
│
├── hooks/              # Custom hooks
│   └── useAuth.ts
│
├── contexts/           # React contexts
│   └── AuthContext.tsx
│
├── types/              # TypeScript types
│   ├── user.ts
│   └── ...
│
└── lib/                # Utilities
    └── utils.ts
```

---

## Data Flow

### Creating a Help Request

```
Frontend (React Component)
  ↓
HelpRequestForm Component
  ↓
handleSubmit() function
  ↓
helpRequestService.createHelpRequest(data)
  ↓
apiClient.post('/api/help-requests', data)
  ↓
HTTP Request to Backend
  ↓
Backend Route: POST /api/help-requests
  ↓
Authentication Middleware (optional)
  ↓
HelpRequestController.create()
  ↓
Validation (class-validator)
  ↓
HelpRequestService.create()
  ↓
HelpRequestDAO.create()
  ↓
Sequelize Model.create()
  ↓
PostgreSQL INSERT
  ↓
Response: { success: true, data: {...} }
  ↓
Frontend receives response
  ↓
State update (setState)
  ↓
UI updates (show success message)
```

### Authentication Flow

```
1. User submits login form
   ↓
2. Frontend: authService.login(credentials)
   ↓
3. POST /api/auth/login
   ↓
4. AuthController.login()
   ↓
5. AuthService.validateCredentials()
   ↓
6. UserDAO.findByUsername()
   ↓
7. bcrypt.compare(password)
   ↓
8. JWT token generation
   ↓
9. Response: { accessToken, refreshToken }
   ↓
10. Frontend stores tokens (localStorage)
   ↓
11. AuthContext updates user state
   ↓
12. Protected routes accessible
```

---

## Database Architecture

### Entity Relationship Overview

```
Users
  ├── 1:1 → VolunteerClubs (optional)
  ├── 1:N → HelpRequests
  ├── 1:N → Donations
  └── N:M → VolunteerClubs (via Memberships)

VolunteerClubs
  ├── 1:1 → User (owner)
  ├── 1:N → Camps
  └── N:M → Users (via Memberships)

HelpRequests
  ├── N:1 → User (optional)
  └── 1:N → Donations

Camps
  └── N:1 → VolunteerClub

Donations
  ├── N:1 → HelpRequest
  └── N:1 → User (donator)

Memberships
  ├── N:1 → User
  └── N:1 → VolunteerClub
```

### Database Connection

```
Application Start
  ↓
Database Config Loaded
  ↓
Sequelize Instance Created
  ↓
Connection Pool Established
  ↓
Models Synchronized (in development)
  ↓
Ready for Queries
```

---

## Security Architecture

### Authentication Flow

```
Request with Authorization Header
  ↓
Authentication Middleware
  ↓
Extract JWT Token
  ↓
Verify Token (jsonwebtoken.verify)
  ↓
Decode User Information
  ↓
Attach User to Request (req.user)
  ↓
Continue to Route Handler
```

### Authorization Flow

```
Authenticated Request
  ↓
Authorization Middleware
  ↓
Check User Role
  ↓
Compare with Required Roles
  ↓
Allow or Deny (403 Forbidden)
```

### Security Layers

1. **Helmet**: Security HTTP headers
2. **CORS**: Cross-origin resource sharing control
3. **Rate Limiting**: Prevent abuse (via Nginx)
4. **Input Validation**: class-validator
5. **SQL Injection Protection**: Sequelize parameterized queries
6. **XSS Protection**: Helmet + input sanitization
7. **Password Hashing**: bcrypt

---

## Deployment Architecture

### Docker Container Structure

```
┌─────────────────────────────────────┐
│         Nginx (Reverse Proxy)        │  ← Port 80/443
├─────────────────────────────────────┤
│         Next.js Frontend            │  ← Port 3001
├─────────────────────────────────────┤
│         Express.js Backend           │  ← Port 3000
├─────────────────────────────────────┤
│         PostgreSQL Database          │  ← Port 5432
└─────────────────────────────────────┘
```

### Production Flow

```
User Request
  ↓
Nginx (Load Balancer)
  ↓
  ├── Static Files → Next.js
  └── API Requests → Express.js
  ↓
Express.js Backend
  ↓
PostgreSQL Database
```

---

## Code Organization Principles

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic
- **DAOs**: Handle data access only
- **Models**: Define data structure

### Dependency Injection
- Services depend on DAOs
- Controllers depend on Services
- Clear dependency hierarchy

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- Proper HTTP status codes

### Type Safety
- TypeScript throughout
- Shared types via `libs/shared`
- Type-safe API communication

---

[← Back to README](../README.md) | [Previous: Technology Stack](03-technology-stack.md) | [Next: Quick Start →](05-quick-start.md)

