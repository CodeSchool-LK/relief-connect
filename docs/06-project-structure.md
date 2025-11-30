# Project Structure

This document provides a detailed breakdown of the Relief Connect project structure.

## Root Directory

```
relief-connect/
├── apps/                    # Applications
├── libs/                    # Shared libraries
├── docker/                  # Docker configuration
├── scripts/                 # Deployment and utility scripts
├── .github/                 # GitHub workflows and templates
├── docker-compose.yml       # Docker Compose configuration
├── nx.json                  # NX monorepo configuration
├── package.json             # Root package.json
├── tsconfig.base.json       # Base TypeScript configuration
├── yarn.lock                # Yarn lock file
└── README.md                # Project README
```

---

## Backend Structure (`apps/api`)

```
apps/api/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── app.config.ts           # Application configuration
│   │   ├── database.ts             # Database connection setup
│   │   └── index.ts                # Config exports
│   │
│   ├── controllers/                # Request handlers (MVC)
│   │   ├── auth_controller.ts      # Authentication endpoints
│   │   ├── user_controller.ts      # User management
│   │   ├── help-request_controller.ts
│   │   ├── camp_controller.ts
│   │   ├── donation_controller.ts
│   │   ├── volunteer-club_controller.ts
│   │   ├── membership_controller.ts
│   │   ├── item_controller.ts
│   │   ├── health_controller.ts
│   │   └── index.ts
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth_service.ts
│   │   ├── user_service.ts
│   │   ├── help-request_service.ts
│   │   ├── camp_service.ts
│   │   ├── donation_service.ts
│   │   ├── volunteer-club_service.ts
│   │   ├── membership_service.ts
│   │   ├── item_service.ts
│   │   └── index.ts
│   │
│   ├── dao/                        # Data Access Objects
│   │   ├── user_dao.ts
│   │   ├── help-request_dao.ts
│   │   ├── camp_dao.ts
│   │   ├── donation_dao.ts
│   │   ├── volunteer-club_dao.ts
│   │   ├── membership_dao.ts
│   │   ├── item_dao.ts
│   │   ├── refresh-token_dao.ts
│   │   └── index.ts
│   │
│   ├── models/                     # Sequelize database models
│   │   ├── user.model.ts
│   │   ├── help-request.model.ts
│   │   ├── camp.model.ts
│   │   ├── donation.model.ts
│   │   ├── volunteer-club.model.ts
│   │   ├── user-volunteer-club-membership.model.ts
│   │   ├── item.model.ts
│   │   ├── refresh-token.model.ts
│   │   └── index.ts
│   │
│   ├── routes/                     # Express route definitions
│   │   ├── common/                 # Base router and utilities
│   │   │   ├── base_router.ts
│   │   │   └── index.ts
│   │   ├── auth/                  # Authentication routes
│   │   │   ├── auth_router.ts
│   │   │   └── index.ts
│   │   ├── user/                  # User routes
│   │   │   ├── user_router.ts
│   │   │   └── index.ts
│   │   ├── help-request/          # Help request routes
│   │   │   ├── help-request_router.ts
│   │   │   └── index.ts
│   │   ├── camp/                  # Camp routes
│   │   │   ├── camp_router.ts
│   │   │   └── index.ts
│   │   ├── donation/              # Donation routes
│   │   │   ├── donation_router.ts
│   │   │   └── index.ts
│   │   ├── volunteer-club/        # Volunteer club routes
│   │   │   ├── volunteer-club_router.ts
│   │   │   └── index.ts
│   │   ├── membership/            # Membership routes
│   │   │   ├── membership_router.ts
│   │   │   └── index.ts
│   │   ├── admin/                 # Admin routes
│   │   │   ├── admin_router.ts
│   │   │   └── index.ts
│   │   ├── health/                # Health check routes
│   │   │   ├── health_router.ts
│   │   │   └── index.ts
│   │   ├── item/                  # Item routes
│   │   │   ├── item_router.ts
│   │   │   └── index.ts
│   │   ├── router_manager.ts     # Central router manager
│   │   └── index.ts
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── authentication.ts      # JWT authentication
│   │   ├── authorization.ts       # Role-based authorization
│   │   ├── validation.ts         # Request validation
│   │   ├── errorHandler.ts       # Error handling
│   │   ├── responseHandler.ts    # Response formatting
│   │   ├── apiKeyAuth.ts         # API key authentication
│   │   └── index.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── jwt.util.ts           # JWT token utilities
│   │   ├── password.util.ts      # Password hashing utilities
│   │   └── index.ts
│   │
│   ├── enums/                      # Backend-specific enums
│   │   ├── environment.enum.ts
│   │   └── index.ts
│   │
│   ├── scripts/                    # Utility scripts
│   │   └── seed-ration-items.ts   # Database seeding script
│   │
│   ├── main.ts                     # Application entry point
│   ├── server.ts                   # Server setup and configuration
│   └── database.ts                 # Database initialization
│
├── dist/                           # Compiled JavaScript (build output)
├── Dockerfile                      # Docker image definition
├── env.example                     # Environment variables example
├── package.json                    # Backend dependencies
├── project.json                    # NX project configuration
└── tsconfig.json                   # TypeScript configuration
```

---

## Frontend Structure (`apps/web`)

```
apps/web/
├── src/
│   ├── pages/                      # Next.js pages (file-based routing)
│   │   ├── _app.tsx               # App wrapper with global providers
│   │   ├── index.tsx              # Home/landing page
│   │   ├── login.tsx             # Login page
│   │   ├── register.tsx          # Registration page
│   │   ├── map.tsx               # Interactive map page
│   │   ├── need-help.tsx         # Create help request
│   │   ├── donate.tsx            # Donation page
│   │   ├── help.tsx              # Help/info page
│   │   ├── my-requests.tsx       # User's help requests
│   │   ├── my-memberships.tsx   # User's club memberships
│   │   ├── find-clubs.tsx        # Browse volunteer clubs
│   │   │
│   │   ├── clubs/                # Volunteer club pages
│   │   │   ├── index.tsx         # List all clubs
│   │   │   ├── dashboard.tsx     # Club dashboard
│   │   │   ├── my-club.tsx       # Club profile management
│   │   │   ├── [id].tsx          # Club details page
│   │   │   └── camps/
│   │   │       └── create.tsx    # Create new camp
│   │   │
│   │   ├── camps/                # Camp pages
│   │   │   ├── [id].tsx          # Camp details
│   │   │   └── [id]/
│   │   │       └── edit.tsx      # Edit camp
│   │   │
│   │   ├── admin/                # Admin pages
│   │   │   ├── dashboard.tsx     # Admin dashboard
│   │   │   ├── users.tsx         # User management
│   │   │   ├── volunteer-clubs.tsx
│   │   │   ├── memberships.tsx
│   │   │   └── users/
│   │   │       └── create-volunteer-club-user.tsx
│   │   │
│   │   ├── request/              # Help request pages
│   │   │   └── [id].tsx          # Request details
│   │   │
│   │   └── request-details.tsx   # Alternative request details
│   │
│   ├── components/                # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── textarea.tsx
│   │   │
│   │   ├── LandingPage.tsx       # Main landing page component
│   │   ├── Map.tsx               # Interactive map component
│   │   ├── HelpRequestForm.tsx   # Help request form
│   │   ├── CampForm.tsx          # Camp registration form
│   │   ├── DonationForm.tsx      # Donation form
│   │   ├── EmergencyRequestForm.tsx
│   │   ├── VolunteerClubCard.tsx # Club card component
│   │   ├── VolunteerClubForm.tsx # Club registration form
│   │   ├── LocationPicker.tsx    # Map-based location picker
│   │   ├── MapFilters.tsx       # Map filtering component
│   │   ├── MapLocationPicker.tsx
│   │   ├── CampMap.tsx
│   │   ├── DropOffLocationsMap.tsx
│   │   ├── DonationInteractionModal.tsx
│   │   ├── SafetyBanner.tsx      # Safety warnings
│   │   ├── LanguageSwitcher.tsx  # Language selector
│   │   ├── RoleBadge.tsx         # User role badge
│   │   └── StatusBadge.tsx       # Status indicator
│   │
│   ├── services/                 # API service layer
│   │   ├── api-client.ts         # Centralized HTTP client
│   │   ├── help-request-service.ts
│   │   ├── camp-service.ts
│   │   ├── donation-service.ts
│   │   ├── volunteer-club-service.ts
│   │   ├── membership-service.ts
│   │   ├── user-service.ts
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useAuth.ts            # Authentication hook
│   │
│   ├── contexts/                 # React Context providers
│   │   └── AuthContext.tsx       # Authentication context
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── help-request.ts
│   │   ├── camp.ts
│   │   ├── donation.ts
│   │   ├── volunteer-club.ts
│   │   ├── membership.ts
│   │   └── index.ts
│   │
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts             # General utilities (cn, etc.)
│   │   └── auth-utils.ts        # Authentication utilities
│   │
│   ├── data/                     # Static data
│   │   └── sri-lanka-locations.ts  # Location data (provinces, districts)
│   │
│   └── styles/                   # CSS and styling
│       ├── globals.css           # Global styles + Tailwind
│       ├── Form.module.css
│       ├── Map.module.css
│       ├── LocationPicker.module.css
│       └── ...
│
├── public/                       # Static assets
│   ├── locales/                 # i18n translation files
│   │   ├── en/
│   │   │   └── common.json
│   │   ├── si/
│   │   │   └── common.json
│   │   └── ta/
│   │       └── common.json
│   └── ...
│
├── .next/                        # Next.js build output
├── components.json               # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
├── next-i18next.config.js       # i18n configuration
├── postcss.config.mjs          # PostCSS configuration
├── Dockerfile                   # Docker image definition
├── package.json                 # Frontend dependencies
├── project.json                 # NX project configuration
└── tsconfig.json                # TypeScript configuration
```

---

## Shared Library Structure (`libs/shared`)

```
libs/shared/
├── src/
│   ├── dtos/                     # Data Transfer Objects
│   │   ├── auth/                # Authentication DTOs
│   │   ├── user/                # User DTOs
│   │   ├── help-request/        # Help request DTOs
│   │   ├── camp/                # Camp DTOs
│   │   ├── donation/            # Donation DTOs
│   │   ├── volunteer-club/      # Volunteer club DTOs
│   │   ├── membership/          # Membership DTOs
│   │   └── ...
│   │
│   ├── interfaces/               # TypeScript interfaces
│   │   ├── user/                # User interfaces
│   │   ├── help-request/        # Help request interfaces
│   │   ├── camp/                # Camp interfaces
│   │   ├── donation/            # Donation interfaces
│   │   ├── volunteer-club/      # Volunteer club interfaces
│   │   └── ...
│   │
│   ├── enums/                    # Enumerations
│   │   ├── user.enum.ts         # User-related enums
│   │   ├── help-request.enum.ts
│   │   ├── camp.enum.ts
│   │   ├── donation.enum.ts
│   │   └── ...
│   │
│   └── index.ts                  # Barrel exports
│
├── dist/                         # Compiled output
├── package.json                  # Shared library package.json
├── project.json                  # NX project configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Scripts Directory

```
scripts/
├── setup-vps.sh              # Initial VPS setup script
├── deploy.sh                 # Deployment script
├── backup.sh                 # Backup creation script
├── rollback.sh               # Rollback script
├── logs.sh                   # Log viewing script
├── status.sh                 # Service status script
└── setup-environments.sh     # Environment setup
```

---

## Docker Directory

```
docker/
└── nginx/
    └── nginx.conf            # Nginx configuration
```

---

## Key Files Explained

### Backend Key Files

- **`main.ts`**: Application entry point, handles graceful shutdown
- **`server.ts`**: Express server setup, middleware configuration
- **`database.ts`**: Sequelize initialization and connection
- **`router_manager.ts`**: Centralized route management
- **`app.config.ts`**: Application configuration loader

### Frontend Key Files

- **`_app.tsx`**: Next.js app wrapper, global providers (AuthContext)
- **`index.tsx`**: Home/landing page
- **`api-client.ts`**: Centralized HTTP client for API calls
- **`AuthContext.tsx`**: Authentication state management
- **`useAuth.ts`**: Authentication hook for components

### Configuration Files

- **`nx.json`**: NX monorepo configuration
- **`tsconfig.base.json`**: Base TypeScript configuration
- **`package.json`**: Root package.json with workspace scripts
- **`docker-compose.yml`**: Docker Compose orchestration
- **`next.config.ts`**: Next.js configuration
- **`components.json`**: shadcn/ui component configuration

---

## File Naming Conventions

### Backend
- **Controllers**: `*_controller.ts`
- **Services**: `*_service.ts`
- **DAOs**: `*_dao.ts`
- **Models**: `*.model.ts`
- **Routes**: `*_router.ts`
- **Middleware**: `*.ts` (descriptive names)

### Frontend
- **Pages**: `*.tsx` (kebab-case for routes)
- **Components**: `PascalCase.tsx`
- **Services**: `*-service.ts`
- **Hooks**: `use*.ts`
- **Types**: `*.ts` (kebab-case)
- **Utils**: `*.ts` (kebab-case)

---

[← Back to README](../README.md) | [Previous: Quick Start](05-quick-start.md) | [Next: API Reference →](07-api-reference.md)

