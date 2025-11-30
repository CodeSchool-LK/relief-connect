# Authentication & Authorization

## Overview

Relief Connect uses JWT (JSON Web Tokens) for authentication and implements role-based access control (RBAC) for authorization.

---

## Authentication

### JWT Token System

The platform uses a dual-token system:

1. **Access Token**: Short-lived token (default: 1 hour) for API requests
2. **Refresh Token**: Long-lived token (default: 7 days) for obtaining new access tokens

### Token Structure

**Access Token Payload:**
```json
{
  "userId": 1,
  "username": "john_doe",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Refresh Token:**
- Stored in database with user association
- Used to generate new access tokens
- Can be revoked on logout

### Authentication Flow

```
1. User submits credentials
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT tokens
   ↓
4. Server returns tokens to client
   ↓
5. Client stores tokens (localStorage)
   ↓
6. Client includes token in requests
   ↓
7. Server validates token on each request
   ↓
8. Server processes request if valid
```

### Login Process

1. **User submits login form** with username and password
2. **Backend validates credentials**:
   - Find user by username
   - Compare password hash with bcrypt
3. **Generate tokens**:
   - Create access token with user info
   - Create refresh token and store in database
4. **Return tokens** to frontend
5. **Frontend stores tokens** in localStorage
6. **Frontend includes token** in Authorization header for subsequent requests

### Token Storage

**Frontend:**
- Access token: Stored in localStorage
- Refresh token: Stored in localStorage
- User info: Stored in React Context (AuthContext)

**Backend:**
- Refresh tokens: Stored in `refresh_tokens` table
- Access tokens: Stateless (validated via signature)

### Token Refresh

When access token expires:

```
1. Client detects expired token (401 response)
   ↓
2. Client sends refresh token to /api/auth/refresh
   ↓
3. Server validates refresh token
   ↓
4. Server generates new access token
   ↓
5. Client updates stored access token
   ↓
6. Client retries original request
```

### Logout Process

1. **Client sends logout request** with refresh token
2. **Server invalidates refresh token** (deletes from database)
3. **Client clears tokens** from localStorage
4. **Client clears user state** from Context
5. **Client redirects** to login page

---

## User Roles

### Role Hierarchy

```
SYSTEM_ADMINISTRATOR (Highest)
    ↓
ADMIN
    ↓
VOLUNTEER_CLUB
    ↓
USER (Lowest)
```

### Role Definitions

#### USER
**Default role for regular users**

**Permissions:**
- Create help requests
- View all help requests and camps
- Make donations to help requests
- View own help requests and donations
- Request to join volunteer clubs
- View own memberships

**Restrictions:**
- Cannot create volunteer clubs
- Cannot create camps
- Cannot manage other users
- Cannot approve memberships

---

#### VOLUNTEER_CLUB
**Role for volunteer organizations**

**Permissions:**
- All USER permissions
- Create and manage volunteer club profile
- Create and manage relief camps
- View club dashboard with statistics
- Approve/reject membership requests
- Manage club members
- View donations to club camps

**Restrictions:**
- Cannot manage other volunteer clubs
- Cannot manage system users
- Cannot access admin dashboard

---

#### ADMIN
**Role for system administrators**

**Permissions:**
- All VOLUNTEER_CLUB permissions
- View all users
- Create, update, delete users
- Create volunteer clubs
- Manage all volunteer clubs
- Manage all memberships
- View system statistics
- Access admin dashboard
- Moderate content

**Restrictions:**
- Cannot access system administrator features
- Cannot modify system configuration

---

#### SYSTEM_ADMINISTRATOR
**Highest level access**

**Permissions:**
- All ADMIN permissions
- Full system access
- System configuration
- User role management
- All administrative functions

---

## Authorization

### Role-Based Access Control (RBAC)

Authorization is enforced at multiple levels:

1. **Route Level**: Middleware checks role before route handler
2. **Controller Level**: Additional checks in controller methods
3. **Service Level**: Business logic enforces ownership rules
4. **Database Level**: Row-level security (future enhancement)

### Authorization Middleware

The `authorize()` middleware function checks user roles:

```typescript
// Require specific role
router.get('/admin-only', 
  authenticate, 
  authorize(UserRole.ADMIN), 
  handler
);

// Require multiple roles (OR)
router.get('/club-or-admin', 
  authenticate, 
  authorize(UserRole.VOLUNTEER_CLUB, UserRole.ADMIN), 
  handler
);
```

### Resource Ownership

Some resources have ownership checks:

- **Help Requests**: Owner (userId) or ADMIN can modify
- **Camps**: Owner (volunteerClubId) or ADMIN can modify
- **Donations**: Owner (donatorId) or ADMIN can modify
- **Memberships**: Club owner or ADMIN can approve/reject

### Authorization Flow

```
1. Request arrives with JWT token
   ↓
2. Authentication middleware validates token
   ↓
3. User object attached to request (req.user)
   ↓
4. Authorization middleware checks role
   ↓
5. If authorized: Continue to route handler
   ↓
6. If not authorized: Return 403 Forbidden
```

---

## Protected Routes

### Public Routes (No Authentication)

- `GET /api/help-requests` - View all help requests
- `GET /api/help-requests/:id` - View specific request
- `GET /api/camps` - View all camps
- `GET /api/camps/:id` - View specific camp
- `GET /api/volunteer-clubs` - View all clubs
- `GET /api/volunteer-clubs/:id` - View specific club
- `GET /api/donations/help-request/:id` - View donations for request
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /health` - Health check

### User Routes (Require USER role)

- `POST /api/help-requests` - Create help request (optional auth)
- `GET /api/users/me` - Get own profile
- `POST /api/donations` - Create donation
- `GET /api/memberships/me` - Get own memberships
- `POST /api/memberships` - Request membership

### Volunteer Club Routes (Require VOLUNTEER_CLUB role)

- `GET /api/volunteer-clubs/me` - Get own club
- `PUT /api/volunteer-clubs/:id` - Update own club
- `POST /api/camps` - Create camp
- `PUT /api/camps/:id` - Update own camps
- `DELETE /api/camps/:id` - Delete own camps
- `PUT /api/memberships/:id` - Approve/reject memberships

### Admin Routes (Require ADMIN role)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/volunteer-clubs` - Create volunteer club
- `PUT /api/volunteer-clubs/:id` - Update any club
- `DELETE /api/volunteer-clubs/:id` - Delete any club
- `GET /api/admin/stats` - System statistics

### System Administrator Routes (Require SYSTEM_ADMINISTRATOR role)

- All ADMIN routes
- System configuration endpoints
- Advanced administrative functions

---

## Security Best Practices

### Password Security

- **Hashing**: Passwords hashed with bcrypt (10 rounds)
- **No Plain Text**: Passwords never stored in plain text
- **Validation**: Strong password requirements (if implemented)
- **Reset**: Password reset functionality (if implemented)

### Token Security

- **HTTPS Only**: Tokens should only be sent over HTTPS in production
- **Short Expiry**: Access tokens expire quickly (1 hour)
- **Refresh Rotation**: Refresh tokens can be rotated
- **Revocation**: Refresh tokens can be revoked on logout
- **Storage**: Tokens stored securely in localStorage (consider httpOnly cookies for production)

### API Security

- **Helmet**: Security headers via Helmet middleware
- **CORS**: Configured CORS for allowed origins
- **Rate Limiting**: Rate limiting via Nginx (production)
- **Input Validation**: All inputs validated with class-validator
- **SQL Injection**: Protected via Sequelize parameterized queries
- **XSS Protection**: Input sanitization and output encoding

### Authentication Middleware

The authentication middleware:

1. Extracts token from `Authorization: Bearer <token>` header
2. Validates token signature
3. Checks token expiration
4. Attaches user object to `req.user`
5. Continues to next middleware or returns 401

### Authorization Middleware

The authorization middleware:

1. Checks if user is authenticated (`req.user` exists)
2. Verifies user role matches required roles
3. Allows request if authorized
4. Returns 403 Forbidden if not authorized
5. Returns 401 Unauthorized if not authenticated

---

## Frontend Authentication

### AuthContext

The frontend uses React Context for authentication state:

```typescript
const {
  user,              // Current user object
  isAuthenticated,   // Boolean: is user logged in
  loading,           // Boolean: is auth state loading
  login,             // Function: login user
  logout,            // Function: logout user
  isAdmin,           // Function: check if admin
  isVolunteerClub,   // Function: check if volunteer club
} = useAuth();
```

### Token Management

**Storing Tokens:**
```typescript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

**Including in Requests:**
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

**Refreshing Tokens:**
```typescript
// Automatically handled by api-client
// On 401 response, attempts refresh
```

### Protected Routes (Frontend)

Frontend pages check authentication:

```typescript
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login');
  }
}, [isAuthenticated]);
```

### Role-Based UI

Components conditionally render based on role:

```typescript
{isAdmin() && <AdminPanel />}
{isVolunteerClub() && <ClubDashboard />}
```

---

## Error Handling

### Authentication Errors

- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Valid token but insufficient permissions
- **400 Bad Request**: Invalid credentials or request format

### Error Responses

```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please login to access this resource"
}
```

---

## Implementation Details

### JWT Configuration

**Environment Variables:**
```env
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### Token Generation

```typescript
// Access token
const accessToken = jwt.sign(
  { userId, username, role },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

// Refresh token (stored in database)
const refreshToken = jwt.sign(
  { userId, type: 'refresh' },
  JWT_REFRESH_SECRET,
  { expiresIn: JWT_REFRESH_EXPIRES_IN }
);
```

### Token Validation

```typescript
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
} catch (error) {
  return res.status(401).json({ error: 'Invalid token' });
}
```

---

[← Back to README](../README.md) | [Previous: API Reference](07-api-reference.md) | [Next: Database Schema →](09-database-schema.md)

