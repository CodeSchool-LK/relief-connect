# API Reference

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourdomain.com`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 chars, unique)",
  "password": "string (optional)",
  "contactNumber": "string (optional)",
  "role": "USER | VOLUNTEER_CLUB | ADMIN | SYSTEM_ADMINISTRATOR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Auth Required:** No

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Auth Required:** No

---

### Refresh Token

**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string"
  }
}
```

**Auth Required:** No

---

### Logout

**POST** `/api/auth/logout`

Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Auth Required:** Yes

---

## User Endpoints

### Get Current User

**GET** `/api/users/me`

Get the currently authenticated user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "contactNumber": "string",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Auth Required:** Yes  
**Roles:** All

---

### Get All Users

**GET** `/api/users`

Get a list of all users (paginated).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

**Auth Required:** Yes  
**Roles:** ADMIN, SYSTEM_ADMINISTRATOR

---

### Get User by ID

**GET** `/api/users/:id`

Get a specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Auth Required:** Yes  
**Roles:** ADMIN, SYSTEM_ADMINISTRATOR

---

### Update User

**PUT** `/api/users/:id`

Update user information.

**Request Body:**
```json
{
  "username": "string (optional)",
  "contactNumber": "string (optional)",
  "role": "string (optional)",
  "status": "ACTIVE | INACTIVE (optional)"
}
```

**Auth Required:** Yes  
**Roles:** ADMIN, SYSTEM_ADMINISTRATOR

---

### Delete User

**DELETE** `/api/users/:id`

Delete a user account.

**Auth Required:** Yes  
**Roles:** ADMIN, SYSTEM_ADMINISTRATOR

---

## Help Request Endpoints

### Get All Help Requests

**GET** `/api/help-requests`

Get a list of all help requests.

**Query Parameters:**
- `urgency` (optional): Filter by urgency (LOW, MEDIUM, HIGH, CRITICAL)
- `status` (optional): Filter by status (OPEN, CLOSED)
- `category` (optional): Filter by category
- `lat` (optional): Latitude for location filtering
- `lng` (optional): Longitude for location filtering
- `radius` (optional): Radius in kilometers

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lat": 6.9271,
      "lng": 79.8612,
      "urgency": "HIGH",
      "shortNote": "Need food and water",
      "approxArea": "Colombo",
      "contactType": "PHONE",
      "contact": "+94771234567",
      "status": "OPEN",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Auth Required:** No

---

### Get Help Request by ID

**GET** `/api/help-requests/:id`

Get a specific help request with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 5,
    "lat": 6.9271,
    "lng": 79.8612,
    "urgency": "HIGH",
    "shortNote": "Need food and water",
    "approxArea": "Colombo",
    "contactType": "PHONE",
    "contact": "+94771234567",
    "name": "John Doe",
    "totalPeople": 4,
    "elders": 1,
    "children": 2,
    "pets": 0,
    "rationItems": ["Rice", "Water"],
    "status": "OPEN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Auth Required:** No

---

### Create Help Request

**POST** `/api/help-requests`

Create a new help request.

**Request Body:**
```json
{
  "lat": 6.9271,
  "lng": 79.8612,
  "urgency": "HIGH",
  "shortNote": "Need food and water",
  "approxArea": "Colombo",
  "contactType": "PHONE",
  "contact": "+94771234567",
  "name": "John Doe",
  "totalPeople": 4,
  "elders": 1,
  "children": 2,
  "pets": 0,
  "rationItems": ["Rice", "Water"]
}
```

**Auth Required:** Optional (USER role can create authenticated requests)

---

### Update Help Request

**PUT** `/api/help-requests/:id`

Update an existing help request.

**Request Body:** (all fields optional)
```json
{
  "urgency": "MEDIUM",
  "shortNote": "Updated note",
  "status": "CLOSED"
}
```

**Auth Required:** Yes  
**Roles:** Owner, ADMIN

---

### Delete Help Request

**DELETE** `/api/help-requests/:id`

Delete a help request.

**Auth Required:** Yes  
**Roles:** Owner, ADMIN

---

## Camp Endpoints

### Get All Camps

**GET** `/api/camps`

Get a list of all relief camps.

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, INACTIVE)
- `campType` (optional): Filter by type (OFFICIAL, COMMUNITY)
- `volunteerClubId` (optional): Filter by volunteer club

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lat": 6.9271,
      "lng": 79.8612,
      "campType": "OFFICIAL",
      "name": "Colombo Relief Camp",
      "peopleRange": "10-50",
      "needs": ["Food", "Medical"],
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Auth Required:** No

---

### Get Camp by ID

**GET** `/api/camps/:id`

Get a specific camp with full details.

**Auth Required:** No

---

### Create Camp

**POST** `/api/camps`

Create a new relief camp.

**Request Body:**
```json
{
  "lat": 6.9271,
  "lng": 79.8612,
  "campType": "OFFICIAL",
  "name": "Colombo Relief Camp",
  "peopleRange": "10-50",
  "needs": ["Food", "Medical"],
  "shortNote": "Official relief camp",
  "contactType": "PHONE",
  "contact": "+94771234567",
  "peopleCount": 25,
  "description": "Full description",
  "location": "Colombo, Sri Lanka"
}
```

**Auth Required:** Yes  
**Roles:** VOLUNTEER_CLUB, ADMIN

---

### Update Camp

**PUT** `/api/camps/:id`

Update an existing camp.

**Auth Required:** Yes  
**Roles:** Owner (VOLUNTEER_CLUB), ADMIN

---

### Delete Camp

**DELETE** `/api/camps/:id`

Delete a camp.

**Auth Required:** Yes  
**Roles:** Owner (VOLUNTEER_CLUB), ADMIN

---

## Donation Endpoints

### Get All Donations

**GET** `/api/donations`

Get a list of all donations.

**Query Parameters:**
- `helpRequestId` (optional): Filter by help request
- `donatorId` (optional): Filter by donor

**Auth Required:** Yes  
**Roles:** ADMIN

---

### Get Donations by Help Request

**GET** `/api/donations/help-request/:id`

Get all donations for a specific help request.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "helpRequestId": 5,
      "donatorId": 10,
      "donatorName": "Jane Doe",
      "donatorMobileNumber": "+94771234567",
      "rationItems": {
        "Rice": 10,
        "Water": 20
      },
      "donatorMarkedScheduled": true,
      "donatorMarkedCompleted": false,
      "ownerMarkedCompleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Auth Required:** No

---

### Create Donation

**POST** `/api/donations`

Create a new donation.

**Request Body:**
```json
{
  "helpRequestId": 5,
  "donatorName": "Jane Doe",
  "donatorMobileNumber": "+94771234567",
  "rationItems": {
    "Rice": 10,
    "Water": 20,
    "Medicine": 5
  }
}
```

**Auth Required:** Yes  
**Roles:** USER

---

### Update Donation

**PUT** `/api/donations/:id`

Update donation status.

**Request Body:**
```json
{
  "donatorMarkedScheduled": true,
  "donatorMarkedCompleted": true,
  "ownerMarkedCompleted": false
}
```

**Auth Required:** Yes  
**Roles:** Owner, ADMIN

---

## Volunteer Club Endpoints

### Get All Volunteer Clubs

**GET** `/api/volunteer-clubs`

Get a list of all volunteer clubs.

**Auth Required:** No

---

### Get Volunteer Club by ID

**GET** `/api/volunteer-clubs/:id`

Get a specific volunteer club.

**Auth Required:** No

---

### Get My Club

**GET** `/api/volunteer-clubs/me`

Get the authenticated volunteer club's profile.

**Auth Required:** Yes  
**Roles:** VOLUNTEER_CLUB

---

### Create Volunteer Club

**POST** `/api/volunteer-clubs`

Create a new volunteer club.

**Request Body:**
```json
{
  "name": "Colombo Relief Organization",
  "description": "Non-profit relief organization",
  "contactNumber": "+94771234567",
  "email": "contact@example.com",
  "address": "123 Main St, Colombo"
}
```

**Auth Required:** Yes  
**Roles:** ADMIN

---

### Update Volunteer Club

**PUT** `/api/volunteer-clubs/:id`

Update volunteer club information.

**Auth Required:** Yes  
**Roles:** Owner, ADMIN

---

## Membership Endpoints

### Get All Memberships

**GET** `/api/memberships`

Get all membership requests.

**Auth Required:** Yes  
**Roles:** ADMIN

---

### Get My Memberships

**GET** `/api/memberships/me`

Get the authenticated user's memberships.

**Auth Required:** Yes  
**Roles:** USER

---

### Request Membership

**POST** `/api/memberships`

Request to join a volunteer club.

**Request Body:**
```json
{
  "volunteerClubId": 1
}
```

**Auth Required:** Yes  
**Roles:** USER

---

### Update Membership

**PUT** `/api/memberships/:id`

Approve or reject a membership request.

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Auth Required:** Yes  
**Roles:** Club Owner, ADMIN

---

## Admin Endpoints

### Get System Statistics

**GET** `/api/admin/stats`

Get system-wide statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalHelpRequests": 500,
    "totalCamps": 20,
    "totalDonations": 1000
  }
}
```

**Auth Required:** Yes  
**Roles:** ADMIN, SYSTEM_ADMINISTRATOR

---

## Health Check Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Auth Required:** No

---

### Readiness Check

**GET** `/health/ready`

Check if the API is ready to serve requests (database connection, etc.).

**Auth Required:** No

---

[← Back to README](../README.md) | [Previous: Project Structure](06-project-structure.md) | [Next: Authentication & Authorization →](08-authentication-authorization.md)

