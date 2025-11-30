# Database Schema

This document describes the complete database schema for Relief Connect.

## Database: PostgreSQL

- **Version**: 14.x or higher
- **Character Set**: UTF-8
- **Timezone**: UTC

---

## Table: `users`

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Username (3-50 characters) |
| `password` | VARCHAR(255) | NULL | Hashed password (bcrypt) |
| `contactNumber` | VARCHAR(50) | NULL | Contact phone number |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | User role (USER, VOLUNTEER_CLUB, ADMIN, SYSTEM_ADMINISTRATOR) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | User status (ACTIVE, INACTIVE, DISABLED) |
| `createdAt` | TIMESTAMP | NOT NULL | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `username`

**Relationships:**
- One-to-one with `volunteer_clubs` (via `userId`)
- One-to-many with `help_requests` (via `userId`)
- One-to-many with `donations` (via `donatorId`)
- Many-to-many with `volunteer_clubs` (via `user_volunteer_club_memberships`)

---

## Table: `volunteer_clubs`

Stores volunteer organization information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique club identifier |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Club name |
| `description` | TEXT | NULL | Club description |
| `contactNumber` | VARCHAR(50) | NULL | Contact phone number |
| `email` | VARCHAR(255) | NULL | Contact email |
| `address` | VARCHAR(500) | NULL | Physical address |
| `userId` | INTEGER | FOREIGN KEY, NULL | Owner user ID (references `users.id`) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Club status (ACTIVE, INACTIVE) |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Foreign key index on `userId`

**Relationships:**
- Many-to-one with `users` (via `userId`)
- One-to-many with `camps` (via `volunteerClubId`)
- Many-to-many with `users` (via `user_volunteer_club_memberships`)

---

## Table: `help_requests`

Stores help requests from users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique request identifier |
| `userId` | INTEGER | FOREIGN KEY, NULL | User ID (optional, references `users.id`) |
| `lat` | DECIMAL(10,8) | NOT NULL | Latitude coordinate |
| `lng` | DECIMAL(11,8) | NOT NULL | Longitude coordinate |
| `urgency` | VARCHAR(20) | NOT NULL | Urgency level (LOW, MEDIUM, HIGH, CRITICAL) |
| `shortNote` | VARCHAR(160) | NOT NULL | Short description (max 160 chars) |
| `approxArea` | VARCHAR(255) | NOT NULL | Approximate location description |
| `contactType` | VARCHAR(20) | NOT NULL | Contact type (PHONE, WHATSAPP, EMAIL, NONE) |
| `contact` | VARCHAR(50) | NULL | Contact information |
| `name` | VARCHAR(100) | NULL | Requester name |
| `totalPeople` | INTEGER | NULL | Total number of people |
| `elders` | INTEGER | NULL | Number of elders |
| `children` | INTEGER | NULL | Number of children |
| `pets` | INTEGER | NULL | Number of pets |
| `rationItems` | TEXT[] | NULL | Array of ration items needed |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'OPEN' | Request status (OPEN, CLOSED) |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `userId`
- Index on `status` for filtering
- Index on `urgency` for filtering
- Spatial index on `(lat, lng)` for location queries

**Relationships:**
- Many-to-one with `users` (via `userId`, optional)
- One-to-many with `donations` (via `helpRequestId`)

---

## Table: `camps`

Stores relief camp information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique camp identifier |
| `lat` | DECIMAL(10,8) | NOT NULL | Latitude coordinate |
| `lng` | DECIMAL(11,8) | NOT NULL | Longitude coordinate |
| `campType` | VARCHAR(50) | NOT NULL | Camp type (OFFICIAL, COMMUNITY) |
| `name` | VARCHAR(255) | NOT NULL | Camp name |
| `peopleRange` | VARCHAR(20) | NOT NULL | People range (1-10, 10-50, 50+) |
| `needs` | TEXT[] | NOT NULL | Array of needs (Food, Medical, etc.) |
| `shortNote` | VARCHAR(500) | NOT NULL | Short description |
| `contactType` | VARCHAR(20) | NOT NULL | Contact type (PHONE, WHATSAPP, EMAIL, NONE) |
| `contact` | VARCHAR(50) | NULL | Contact information |
| `volunteerClubId` | INTEGER | FOREIGN KEY, NULL | Volunteer club ID (references `volunteer_clubs.id`) |
| `peopleCount` | INTEGER | NULL | Actual people count |
| `description` | TEXT | NULL | Full description |
| `location` | VARCHAR(500) | NULL | Location description |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Camp status (ACTIVE, INACTIVE) |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `volunteerClubId`
- Index on `status` for filtering
- Spatial index on `(lat, lng)` for location queries

**Relationships:**
- Many-to-one with `volunteer_clubs` (via `volunteerClubId`)

---

## Table: `donations`

Stores donation information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique donation identifier |
| `helpRequestId` | INTEGER | FOREIGN KEY, NOT NULL | Help request ID (references `help_requests.id`) |
| `donatorId` | INTEGER | FOREIGN KEY, NOT NULL | Donor user ID (references `users.id`) |
| `donatorName` | VARCHAR(100) | NOT NULL | Donor name |
| `donatorMobileNumber` | VARCHAR(20) | NOT NULL | Donor mobile number |
| `rationItems` | JSONB | NOT NULL | Donated items (key-value pairs) |
| `donatorMarkedScheduled` | BOOLEAN | NOT NULL, DEFAULT false | Donor marked as scheduled |
| `donatorMarkedCompleted` | BOOLEAN | NOT NULL, DEFAULT false | Donor marked as completed |
| `ownerMarkedCompleted` | BOOLEAN | NOT NULL, DEFAULT false | Request owner confirmed receipt |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `helpRequestId`
- Foreign key index on `donatorId`
- Index on `helpRequestId` for querying donations by request

**Relationships:**
- Many-to-one with `help_requests` (via `helpRequestId`)
- Many-to-one with `users` (via `donatorId`)

**Example `rationItems` JSON:**
```json
{
  "Rice": 10,
  "Water": 20,
  "Medicine": 5
}
```

---

## Table: `user_volunteer_club_memberships`

Junction table for user-club memberships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique membership identifier |
| `userId` | INTEGER | FOREIGN KEY, NOT NULL | User ID (references `users.id`) |
| `volunteerClubId` | INTEGER | FOREIGN KEY, NOT NULL | Volunteer club ID (references `volunteer_clubs.id`) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Membership status (PENDING, APPROVED, REJECTED) |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `userId`
- Foreign key index on `volunteerClubId`
- Unique index on `(userId, volunteerClubId)` to prevent duplicate memberships

**Relationships:**
- Many-to-one with `users` (via `userId`)
- Many-to-one with `volunteer_clubs` (via `volunteerClubId`)

---

## Table: `refresh_tokens`

Stores refresh tokens for JWT authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique token identifier |
| `userId` | INTEGER | FOREIGN KEY, NOT NULL | User ID (references `users.id`) |
| `token` | VARCHAR(500) | NOT NULL, UNIQUE | Refresh token string |
| `expiresAt` | TIMESTAMP | NOT NULL | Token expiration timestamp |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `userId`
- Unique index on `token`
- Index on `expiresAt` for cleanup queries

**Relationships:**
- Many-to-one with `users` (via `userId`)

---

## Table: `items`

Stores catalog of available ration items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique item identifier |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Item name |
| `category` | VARCHAR(100) | NULL | Item category |
| `unit` | VARCHAR(50) | NULL | Measurement unit (kg, liters, etc.) |
| `description` | TEXT | NULL | Item description |
| `createdAt` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `name`

---

## Entity Relationship Diagram

```
Users
  ├── 1:1 → VolunteerClubs (optional, via userId)
  ├── 1:N → HelpRequests (optional, via userId)
  ├── 1:N → Donations (via donatorId)
  ├── 1:N → RefreshTokens (via userId)
  └── N:M → VolunteerClubs (via Memberships)

VolunteerClubs
  ├── 1:1 → User (owner, via userId)
  ├── 1:N → Camps (via volunteerClubId)
  └── N:M → Users (via Memberships)

HelpRequests
  ├── N:1 → User (optional, via userId)
  └── 1:N → Donations (via helpRequestId)

Camps
  └── N:1 → VolunteerClub (via volunteerClubId)

Donations
  ├── N:1 → HelpRequest (via helpRequestId)
  └── N:1 → User (via donatorId)

Memberships
  ├── N:1 → User (via userId)
  └── N:1 → VolunteerClub (via volunteerClubId)
```

---

## Database Constraints

### Foreign Key Constraints

- `volunteer_clubs.userId` → `users.id` (ON DELETE SET NULL)
- `help_requests.userId` → `users.id` (ON DELETE SET NULL)
- `donations.helpRequestId` → `help_requests.id` (ON DELETE CASCADE)
- `donations.donatorId` → `users.id` (ON DELETE CASCADE)
- `camps.volunteerClubId` → `volunteer_clubs.id` (ON DELETE SET NULL)
- `user_volunteer_club_memberships.userId` → `users.id` (ON DELETE CASCADE)
- `user_volunteer_club_memberships.volunteerClubId` → `volunteer_clubs.id` (ON DELETE CASCADE)
- `refresh_tokens.userId` → `users.id` (ON DELETE CASCADE)

### Check Constraints

- `users.role` IN ('USER', 'VOLUNTEER_CLUB', 'ADMIN', 'SYSTEM_ADMINISTRATOR')
- `users.status` IN ('ACTIVE', 'INACTIVE', 'DISABLED')
- `help_requests.urgency` IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- `help_requests.status` IN ('OPEN', 'CLOSED')
- `help_requests.contactType` IN ('PHONE', 'WHATSAPP', 'EMAIL', 'NONE')
- `camps.status` IN ('ACTIVE', 'INACTIVE')
- `camps.campType` IN ('OFFICIAL', 'COMMUNITY')
- `user_volunteer_club_memberships.status` IN ('PENDING', 'APPROVED', 'REJECTED')

---

## Indexes for Performance

### Primary Indexes
- All tables have primary key indexes on `id`

### Foreign Key Indexes
- All foreign key columns are indexed

### Query Optimization Indexes
- `help_requests(status, urgency)` - Composite index for filtering
- `help_requests(lat, lng)` - Spatial index for location queries
- `camps(status, volunteerClubId)` - Composite index for filtering
- `donations(helpRequestId)` - Index for querying donations by request
- `refresh_tokens(expiresAt)` - Index for token cleanup

---

## Data Types

### Enumerations (Stored as VARCHAR)

- User roles
- User statuses
- Request urgency levels
- Request statuses
- Contact types
- Camp types
- Camp statuses
- Membership statuses

### JSON/JSONB

- `donations.rationItems` - JSONB for flexible item storage
- `help_requests.rationItems` - TEXT[] array (PostgreSQL array type)

### Spatial Data

- `lat` / `lng` - DECIMAL for precise coordinate storage
- Consider PostGIS extension for advanced spatial queries (future)

---

## Migration Strategy

Database schema is managed via Sequelize:

- **Development**: Auto-sync models (not recommended for production)
- **Production**: Use migrations for schema changes
- **Seeding**: Use seed scripts for initial data

---

[← Back to README](../README.md) | [Previous: Authentication & Authorization](08-authentication-authorization.md) | [Next: Deployment →](10-deployment.md)

