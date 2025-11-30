# Relief Connect Web

Next.js frontend application for the Relief Connect platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- Yarn 4.x (via Corepack)
- Backend API running (see [apps/api/README.md](../api/README.md))

### Installation

```bash
# From project root
yarn install

# Build shared library first
yarn shared:build

# Install web dependencies
cd apps/web
yarn install
```

### Environment Setup

Create a `.env.local` file in `apps/web/`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Map Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Running

```bash
# Development server (port 3001)
yarn dev

# Production build
yarn build

# Production start
yarn start
```

The application will be available at `http://localhost:3001`

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── pages/           # Next.js pages (file-based routing)
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── services/        # API service layer
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React Context providers
│   ├── types/          # TypeScript types
│   ├── lib/            # Utility functions
│   ├── data/           # Static data
│   └── styles/         # CSS files
├── public/             # Static assets
│   └── locales/       # i18n translation files
├── .next/             # Next.js build output
└── package.json       # Dependencies
```

---

## 🎨 Features

### Pages

- **Home** (`/`) - Landing page with analytics
- **Map** (`/map`) - Interactive map with requests and camps
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Need Help** (`/need-help`) - Create help request
- **Donate** (`/donate`) - Donation page
- **Clubs** (`/clubs`) - Browse volunteer clubs
- **Club Dashboard** (`/clubs/dashboard`) - Volunteer club dashboard
- **Admin Dashboard** (`/admin/dashboard`) - Admin panel

### Components

- `LandingPage` - Main landing page
- `Map` - Interactive Leaflet map
- `HelpRequestForm` - Help request creation
- `CampForm` - Camp registration
- `DonationForm` - Donation form
- `VolunteerClubCard` - Club card component
- And more...

---

## 🛠️ Technology Stack

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Leaflet** - Maps
- **next-i18next** - Internationalization

📖 **[Full Tech Stack →](../../docs/03-technology-stack.md)**

---

## 🌐 Internationalization

The app supports multiple languages:

- **English** (en)
- **Sinhala** (si)
- **Tamil** (ta)

Translation files are in `public/locales/`.

### Using Translations

```typescript
import { useTranslation } from 'next-i18next';

function Component() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

---

## 🗺️ Maps

Interactive maps powered by Leaflet and OpenStreetMap.

### Features

- Color-coded markers by urgency
- Camp markers
- Filtering by category, urgency, district
- Location picker
- Popups with details

### Usage

```typescript
import Map from '../components/Map';

<Map 
  helpRequests={requests}
  camps={camps}
  filters={filters}
/>
```

---

## 🔐 Authentication

Authentication is handled via React Context.

### Using Auth

```typescript
import { useAuth } from '../hooks/useAuth';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <Dashboard user={user} />;
}
```

📖 **[Full Auth Docs →](../../docs/08-authentication-authorization.md)**

---

## 📡 API Integration

API calls are made through the service layer.

### Services

- `api-client` - Centralized HTTP client
- `help-request-service` - Help request API
- `camp-service` - Camp API
- `donation-service` - Donation API
- `volunteer-club-service` - Volunteer club API
- `user-service` - User API

### Example

```typescript
import { helpRequestService } from '../services';

const response = await helpRequestService.getAllHelpRequests();
if (response.success) {
  setRequests(response.data);
}
```

---

## 🎨 Styling

### Tailwind CSS

Utility-first CSS framework. Most styling uses Tailwind classes.

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold">Title</h2>
</div>
```

### CSS Modules

Component-specific styles use CSS Modules.

```tsx
import styles from './Component.module.css';

<div className={styles.container}>
  Content
</div>
```

### shadcn/ui Components

Pre-built accessible components in `components/ui/`.

```tsx
import { Button } from '../components/ui/button';

<Button variant="default" size="lg">
  Click me
</Button>
```

---

## 🛠️ Development

### Available Scripts

```bash
yarn dev          # Development server (port 3001)
yarn build        # Production build
yarn start        # Production server
yarn lint         # Run ESLint
yarn lint:fix     # Fix linting issues
yarn type-check   # TypeScript type checking
```

### Code Style

- Functional components with hooks
- TypeScript for type safety
- Tailwind for styling
- Component composition
- Service layer for API calls

📖 **[Full Development Guide →](../../docs/11-development.md)**

---

## 📱 Responsive Design

The app is mobile-first and responsive:

- **Mobile**: Optimized for small screens
- **Tablet**: Enhanced layout
- **Desktop**: Full-featured experience

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 🧪 Testing

```bash
# Run tests (when implemented)
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
docker build -t relief-connect-web .
```

### Run Container

```bash
docker run -p 3001:3001 --env-file .env.local relief-connect-web
```

---

## 📚 Documentation

- **[Frontend Overview](../../docs/FRONTEND_OVERVIEW.md)** - Detailed frontend guide
- **[Project Structure](../../docs/06-project-structure.md#frontend-structure-appsweb)** - Directory structure
- **[Development Guide](../../docs/11-development.md#frontend-development)** - Development workflows
- **[API Reference](../../docs/07-api-reference.md)** - Backend API docs

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_MAP_TILE_URL` | Map tile URL | Yes |

### Next.js Configuration

See `next.config.ts` for Next.js configuration.

### Tailwind Configuration

Tailwind is configured via `tailwind.config.js` (if exists) or CSS variables.

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
yarn build
```

### Type Errors

```bash
# Rebuild shared library
cd ../..
yarn shared:build

# Type check
yarn type-check
```

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend API is running
- Check CORS configuration on backend

---

## 📝 License

MIT License - see [LICENSE](../../LICENSE) file.

---

[← Back to Project Root](../../README.md) | [Full Documentation →](../../docs/README.md)

