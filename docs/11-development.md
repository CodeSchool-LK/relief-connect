# Development Guide

This guide covers development workflows, best practices, and tools for contributing to Relief Connect.

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Yarn 4.x (via Corepack)
- Git
- VS Code (recommended) or your preferred IDE

### Initial Setup

Follow the [Quick Start Guide](05-quick-start.md) to set up your development environment.

---

## Available Scripts

### Root Level Scripts

```bash
# Install all dependencies
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

### Backend Scripts (`apps/api`)

```bash
# Development server with hot reload
yarn api:dev

# Build TypeScript
yarn api:build

# Start production server
yarn api:start

# Lint code
yarn api:lint

# Fix linting issues
yarn api:lint:fix
```

### Frontend Scripts (`apps/web`)

```bash
# Development server (port 3001)
yarn web:dev

# Build for production
yarn web:build

# Start production server
yarn web:start

# Type check
yarn web:type-check

# Lint
yarn web:lint

# Fix linting
yarn web:lint:fix
```

### Shared Library Scripts

```bash
# Build shared library
yarn shared:build

# Watch mode (auto-rebuild on changes)
yarn shared:watch
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the project's style guide
- Add tests if applicable
- Update documentation

### 3. Test Locally

```bash
# Start backend
yarn api:dev

# Start frontend (in another terminal)
yarn web:dev

# Run type checking
yarn type-check

# Run linters
yarn api:lint
yarn web:lint
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub.

---

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type (use `unknown` if needed)

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx`
- Services: `kebab-case-service.ts`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`

**Variables and Functions:**
- camelCase for variables and functions
- PascalCase for classes and components
- UPPER_SNAKE_CASE for constants
- Descriptive names (avoid abbreviations)

**Database:**
- camelCase for model properties
- PascalCase for model classes

### Code Organization

**Backend:**
```
Controller → Service → DAO → Model
```

**Frontend:**
```
Page → Component → Service → API
```

### Import Order

1. External libraries
2. Internal modules
3. Types/interfaces
4. Relative imports

```typescript
// External
import React from 'react';
import { useRouter } from 'next/router';

// Internal
import { useAuth } from '../../hooks/useAuth';
import { helpRequestService } from '../../services';

// Types
import { IHelpRequest } from '../../types/help-request';

// Relative
import './styles.css';
```

---

## Architecture Patterns

### Backend Patterns

**Layered Architecture:**
- Controllers handle HTTP requests/responses
- Services contain business logic
- DAOs handle data access
- Models define data structure

**Error Handling:**
- Use centralized error handler middleware
- Return consistent error response format
- Log errors appropriately

**Validation:**
- Use class-validator decorators
- Validate at controller level
- Return clear error messages

### Frontend Patterns

**Component Structure:**
- Functional components with hooks
- Separate presentational and container components
- Reusable UI components in `components/ui/`

**State Management:**
- React Context for global state (Auth)
- useState for local component state
- useMemo for derived state
- useEffect for side effects

**API Communication:**
- Use service layer (not direct fetch calls)
- Centralized API client
- Error handling in services
- Type-safe API calls

---

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Writing Tests

**Backend Tests:**
- Unit tests for services
- Integration tests for API endpoints
- Test database operations

**Frontend Tests:**
- Component tests with React Testing Library
- Service tests
- E2E tests (if applicable)

---

## Debugging

### Backend Debugging

**VS Code Launch Configuration:**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["api:dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Debugging Tips:**
- Use `console.log` for quick debugging
- Use debugger breakpoints
- Check database queries in logs
- Verify environment variables

### Frontend Debugging

**Browser DevTools:**
- React DevTools extension
- Network tab for API calls
- Console for errors
- Application tab for localStorage

**VS Code Debugging:**

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Next.js",
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["web:dev"],
  "console": "integratedTerminal"
}
```

---

## Database Development

### Running Migrations

```bash
# Create migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Rollback
npx sequelize-cli db:migrate:undo
```

### Seeding Data

```bash
# Run seeders
npx sequelize-cli db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed seed-file-name
```

### Database Queries

Use Sequelize query methods:

```typescript
// Find all
const users = await UserModel.findAll();

// Find one
const user = await UserModel.findByPk(id);

// Create
const newUser = await UserModel.create(data);

// Update
await user.update(data);

// Delete
await user.destroy();
```

---

## API Development

### Adding New Endpoints

1. **Create Controller Method:**
```typescript
// controllers/example_controller.ts
export class ExampleController {
  async getExample(req: Request, res: Response) {
    // Implementation
  }
}
```

2. **Create Service Method:**
```typescript
// services/example_service.ts
export class ExampleService {
  async getExample(id: number) {
    // Business logic
  }
}
```

3. **Create Route:**
```typescript
// routes/example/example_router.ts
router.get('/:id', 
  authenticate,
  authorize(UserRole.USER),
  exampleController.getExample
);
```

4. **Register Route:**
```typescript
// routes/router_manager.ts
this.mainRouter.use('/api/example', exampleRouter);
```

### Testing API Endpoints

Use tools like Postman or Insomnia:

1. Import API collection
2. Set environment variables
3. Test endpoints
4. Verify responses

---

## Frontend Development

### Adding New Pages

1. Create file in `apps/web/src/pages/`
2. Export default component
3. Add routing (automatic with file-based routing)

### Adding New Components

1. Create component in `apps/web/src/components/`
2. Use TypeScript interfaces for props
3. Follow component structure:

```typescript
interface ComponentProps {
  // Props definition
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Using Services

```typescript
import { helpRequestService } from '../../services';

const response = await helpRequestService.getAllHelpRequests();
if (response.success) {
  // Handle success
}
```

---

## Common Tasks

### Adding a New Model

1. Create model in `apps/api/src/models/`
2. Define Sequelize model with decorators
3. Add to model index
4. Create DAO
5. Create service
6. Create controller
7. Create routes

### Adding a New Enum

1. Add to `libs/shared/src/enums/`
2. Export from enum index
3. Use in models and DTOs

### Updating Shared Types

1. Update in `libs/shared/src/`
2. Rebuild shared library: `yarn shared:build`
3. Use in both frontend and backend

---

## Performance Optimization

### Backend

- Use database indexes
- Optimize queries (avoid N+1)
- Use connection pooling
- Cache frequently accessed data
- Paginate large datasets

### Frontend

- Code splitting
- Lazy load components
- Optimize images
- Use React.memo for expensive components
- Debounce search inputs

---

## Troubleshooting

### Type Errors

```bash
# Rebuild shared library
yarn shared:build

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
yarn install
```

### Database Connection

- Verify PostgreSQL is running
- Check environment variables
- Test connection: `psql -U postgres -d relief_connect`

### Port Conflicts

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Refactoring
- `test/` - Tests

### Commit Messages

Follow Conventional Commits:

```
feat: add user registration endpoint
fix: resolve database connection issue
docs: update API documentation
refactor: reorganize service layer
test: add unit tests for auth service
```

### Pull Request Process

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create PR with description
5. Address review comments
6. Merge after approval

---

## Testing Credentials (Development Environment)

### Frontend (FE) URL

- [https://dev-web.pasindusampath.com/](https://dev-web.pasindusampath.com/)

### Backend (API) URL

- [https://dev-api.pasindusampath.com/](https://dev-api.pasindusampath.com/)

---

### Admin Login (Dev Environment Only)

- **Username:** `pasindusampath`
- **Password:** `77889900`

---

### Volunteer Club Login

- **Username:** `test-club`
- **Password:** `123456789`

---

### Normal Users

- No password required.
- They can log in using **only their unique username**.

---

### Creating New Volunteer Accounts

- You can create additional volunteer club accounts through the **Admin Panel**.

---

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL GUI
- [VS Code](https://code.visualstudio.com/) - IDE
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser extension

---

[← Back to README](../README.md) | [Previous: Deployment](10-deployment.md) | [Next: Contributing →](12-contributing.md)

