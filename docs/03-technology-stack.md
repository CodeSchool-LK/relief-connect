# Technology Stack

## Frontend (`apps/web`)

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.0.3 | React framework with SSR/SSG, file-based routing, and API routes |
| **React** | 18.3.1 | UI library for building interactive user interfaces |
| **TypeScript** | 5.3.3 | Type-safe JavaScript for better development experience |

### Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.17 | Utility-first CSS framework for rapid UI development |
| **shadcn/ui** | Latest | Accessible UI component library built on Radix UI |
| **Radix UI** | Various | Unstyled, accessible component primitives |
| **Lucide React** | 0.555.0 | Beautiful, customizable icon library |
| **CSS Modules** | Built-in | Component-scoped CSS for complex styling |

### Maps & Location

| Technology | Version | Purpose |
|------------|---------|---------|
| **Leaflet** | 1.9.4 | Open-source JavaScript library for interactive maps |
| **React Leaflet** | 4.2.1 | React components for Leaflet integration |
| **OpenStreetMap** | - | Free, open-source map tiles |

### Internationalization

| Technology | Version | Purpose |
|------------|---------|---------|
| **next-i18next** | 15.2.0 | Internationalization framework for Next.js |
| **i18next** | 23.7.6 | Core internationalization framework |
| **react-i18next** | 14.0.0 | React bindings for i18next |

### HTTP Client

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.6.2 | Promise-based HTTP client (optional, uses native fetch) |
| **Native Fetch API** | Built-in | Modern browser API for HTTP requests |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **clsx** | 2.1.1 | Utility for constructing className strings conditionally |
| **tailwind-merge** | 3.4.0 | Merge Tailwind CSS classes without style conflicts |
| **class-variance-authority** | 0.7.1 | Build type-safe component variants |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 8.57.0 | JavaScript/TypeScript linter |
| **TypeScript** | 5.3.3 | Type checking and compilation |

---

## Backend (`apps/api`)

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Fast, unopinionated web framework for Node.js |
| **TypeScript** | 5.3.3 | Type-safe JavaScript for backend development |
| **Node.js** | 18+ | JavaScript runtime environment |

### Database & ORM

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 14+ | Powerful, open-source relational database |
| **Sequelize** | 6.35.2 | Promise-based Node.js ORM for PostgreSQL |
| **sequelize-typescript** | 2.1.6 | TypeScript decorators for Sequelize models |
| **pg** | 8.11.3 | PostgreSQL client for Node.js |
| **pg-hstore** | 2.3.4 | Serialize/deserialize hstore format for PostgreSQL |

### Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| **jsonwebtoken** | 9.0.2 | JSON Web Token implementation for authentication |
| **bcrypt** | 5.1.1 | Password hashing library |
| **Helmet** | 7.1.0 | Security middleware setting various HTTP headers |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing middleware |

### Validation & Transformation

| Technology | Version | Purpose |
|------------|---------|---------|
| **class-validator** | 0.14.1 | Decorator-based validation library |
| **class-transformer** | 0.5.1 | Transform plain objects to class instances and vice versa |
| **reflect-metadata** | 0.1.13 | Polyfill for Metadata Reflection API (required for decorators) |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **dotenv** | 16.3.1 | Load environment variables from .env file |
| **morgan** | 1.10.0 | HTTP request logger middleware |
| **tslib** | 2.6.2 | Runtime library for TypeScript helper functions |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ts-node-dev** | 2.0.0 | TypeScript execution environment with hot reload |
| **ts-node** | 10.9.2 | TypeScript execution environment |
| **nodemon** | 3.0.1 | Monitor for changes and restart server |
| **ESLint** | 8.56.0 | JavaScript/TypeScript linter |
| **sequelize-cli** | 6.6.2 | Sequelize command-line interface for migrations |

---

## Shared Library (`libs/shared`)

### Purpose
Shared code between frontend and backend to ensure type safety and consistency.

### Contents
- **DTOs (Data Transfer Objects)**: Type-safe data structures for API communication
- **Interfaces**: TypeScript interfaces shared across applications
- **Enums**: Shared enumerations (UserRole, Urgency, Status, etc.)
- **Types**: Common type definitions

---

## Infrastructure & DevOps

### Monorepo Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **NX** | 21.6.5 | Monorepo build system and development tools |
| **Yarn** | 4.0.2 | Package manager with workspace support |

### Containerization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Containerization platform |
| **Docker Compose** | Latest | Multi-container Docker application orchestration |

### Web Server

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nginx** | Latest | Reverse proxy, load balancer, and web server |

### CI/CD

| Technology | Version | Purpose |
|------------|---------|---------|
| **GitHub Actions** | - | Continuous Integration and Deployment pipelines |

---

## Development Environment

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime |
| **PostgreSQL** | 14.x+ | Database server |
| **Yarn** | 4.x | Package manager (via Corepack) |
| **Git** | Latest | Version control |

### Optional Tools

| Tool | Purpose |
|------|---------|
| **Docker Desktop** | Local containerized development |
| **Postman/Insomnia** | API testing |
| **VS Code** | Recommended IDE with TypeScript support |
| **pgAdmin** | PostgreSQL database management |

---

## Technology Decisions

### Why Next.js?
- **Server-Side Rendering**: Better SEO and initial load performance
- **File-Based Routing**: Intuitive routing system
- **API Routes**: Built-in API endpoints
- **Optimization**: Automatic code splitting and optimization
- **Ecosystem**: Large community and extensive documentation

### Why Express.js?
- **Mature**: Battle-tested framework with large ecosystem
- **Flexible**: Unopinionated, allows custom architecture
- **Performance**: Fast and lightweight
- **Middleware**: Rich middleware ecosystem
- **TypeScript Support**: Excellent TypeScript integration

### Why PostgreSQL?
- **Reliability**: ACID compliance and data integrity
- **Features**: Advanced features (JSON, arrays, full-text search)
- **Performance**: Excellent performance for complex queries
- **Scalability**: Handles large datasets efficiently
- **Open Source**: Free and open-source

### Why Sequelize?
- **TypeScript Support**: Excellent TypeScript integration
- **Migrations**: Built-in migration system
- **Relations**: Easy relationship management
- **Validation**: Model-level validation
- **Transactions**: Built-in transaction support

### Why Leaflet?
- **Open Source**: Free and open-source
- **Lightweight**: Small bundle size
- **Customizable**: Highly customizable markers and popups
- **Mobile-Friendly**: Touch-friendly interactions
- **No API Key**: Works with OpenStreetMap without API keys

### Why NX Monorepo?
- **Code Sharing**: Easy sharing between frontend and backend
- **Build Optimization**: Intelligent build caching
- **Dependency Management**: Centralized dependency management
- **Developer Experience**: Excellent tooling and developer experience
- **Scalability**: Scales well as project grows

---

## Version Compatibility

### Node.js
- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x LTS
- **Maximum**: Node.js 22.x

### PostgreSQL
- **Minimum**: PostgreSQL 14.x
- **Recommended**: PostgreSQL 16.x
- **Maximum**: Latest stable version

### Browser Support
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari 14+, Chrome Android (latest)

---

[← Back to README](../README.md) | [Previous: Features](02-features.md) | [Next: Architecture →](04-architecture.md)

