# Shared Library

Shared code library for Relief Connect. Contains DTOs, interfaces, and enums used by both frontend and backend.

## 📦 Purpose

This library ensures type safety and consistency between the frontend and backend by sharing:

- **DTOs** (Data Transfer Objects) - Type-safe data structures for API communication
- **Interfaces** - TypeScript interfaces shared across applications
- **Enums** - Shared enumerations (UserRole, Urgency, Status, etc.)
- **Types** - Common type definitions

## 🚀 Usage

### Installation

The shared library is automatically linked via NX workspace. No manual installation needed.

### Building

```bash
# From project root
yarn shared:build

# Watch mode (auto-rebuild on changes)
yarn shared:watch
```

### Importing

**In Backend (`apps/api`):**
```typescript
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';
```

**In Frontend (`apps/web`):**
```typescript
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { IHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/IHelpRequest';
```

## 📁 Structure

```
libs/shared/
├── src/
│   ├── dtos/              # Data Transfer Objects
│   │   ├── auth/          # Authentication DTOs
│   │   ├── user/          # User DTOs
│   │   ├── help-request/  # Help request DTOs
│   │   ├── camp/          # Camp DTOs
│   │   ├── donation/      # Donation DTOs
│   │   ├── volunteer-club/# Volunteer club DTOs
│   │   └── membership/    # Membership DTOs
│   │
│   ├── interfaces/        # TypeScript interfaces
│   │   ├── user/          # User interfaces
│   │   ├── help-request/  # Help request interfaces
│   │   ├── camp/          # Camp interfaces
│   │   ├── donation/      # Donation interfaces
│   │   ├── volunteer-club/# Volunteer club interfaces
│   │   └── membership/    # Membership interfaces
│   │
│   ├── enums/             # Enumerations
│   │   ├── user.enum.ts   # User-related enums
│   │   ├── help-request.enum.ts
│   │   ├── camp.enum.ts
│   │   ├── donation.enum.ts
│   │   └── ...
│   │
│   └── index.ts            # Barrel exports
│
├── dist/                  # Compiled output
├── package.json
└── tsconfig.json
```

## 📝 Available Exports

### Enums

```typescript
// User roles
export enum UserRole {
  USER = 'USER',
  VOLUNTEER_CLUB = 'VOLUNTEER_CLUB',
  ADMIN = 'ADMIN',
  SYSTEM_ADMINISTRATOR = 'SYSTEM_ADMINISTRATOR',
}

// User status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISABLED = 'DISABLED',
}

// Request urgency
export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Request status
export enum HelpRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// Contact type
export enum ContactType {
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  NONE = 'NONE',
}

// Camp type
export enum CampType {
  OFFICIAL = 'OFFICIAL',
  COMMUNITY = 'COMMUNITY',
}

// Camp status
export enum CampStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Membership status
export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

### Interfaces

Common interfaces include:

- `IUser` - User interface
- `IVolunteerClub` - Volunteer club interface
- `IHelpRequest` - Help request interface
- `ICamp` - Camp interface
- `IDonation` - Donation interface
- `IMembership` - Membership interface

### DTOs

DTOs for request/response objects:

- `CreateUserDto`
- `LoginDto`
- `CreateHelpRequestDto`
- `CreateCampDto`
- `CreateDonationDto`
- And more...

## 🔧 Development

### Adding New Types

1. **Add Enum:**
   ```typescript
   // src/enums/example.enum.ts
   export enum ExampleEnum {
     VALUE1 = 'VALUE1',
     VALUE2 = 'VALUE2',
   }
   ```

2. **Add Interface:**
   ```typescript
   // src/interfaces/example/IExample.ts
   export interface IExample {
     id: number;
     name: string;
   }
   ```

3. **Add DTO:**
   ```typescript
   // src/dtos/example/create-example.dto.ts
   export class CreateExampleDto {
     name: string;
   }
   ```

4. **Export from index:**
   ```typescript
   // src/enums/index.ts
   export * from './example.enum';
   ```

5. **Rebuild:**
   ```bash
   yarn shared:build
   ```

### Type Safety

- All types are strictly typed
- No `any` types allowed
- Interfaces match database models
- DTOs validate API requests/responses

## 📚 Best Practices

### When to Add to Shared Library

✅ **Add:**
- Types used by both frontend and backend
- API request/response types
- Enums used across applications
- Common interfaces

❌ **Don't Add:**
- Frontend-only types (add to `apps/web/src/types/`)
- Backend-only types (add to `apps/api/src/`)
- Implementation-specific types
- Utility functions (use in respective apps)

### Naming Conventions

- **Enums**: `PascalCase` with descriptive names (e.g., `UserRole`)
- **Interfaces**: `I` prefix (e.g., `IUser`)
- **DTOs**: Descriptive names with `Dto` suffix (e.g., `CreateUserDto`)
- **Files**: kebab-case (e.g., `user.enum.ts`)

## 🔄 Updating Shared Library

When you update the shared library:

1. Make your changes
2. Rebuild: `yarn shared:build`
3. Both frontend and backend will use updated types
4. No need to restart dev servers (they'll pick up changes)

## 🐛 Troubleshooting

### Type Errors After Changes

```bash
# Rebuild shared library
yarn shared:build

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Import Errors

Ensure you're using the correct import path:
```typescript
// Correct
import { UserRole } from '@nx-mono-repo-deployment-test/shared/src/enums';

// Wrong
import { UserRole } from 'shared/enums';
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist
yarn shared:build
```

## 📝 License

MIT License - see [LICENSE](../../LICENSE) file.

---

[← Back to Project Root](../../README.md) | [Full Documentation →](../../docs/README.md)

