# Users API Examples - Admin Panel

## Base URL

```
/api/users
```

## Authentication

All admin endpoints require:

```
Authorization: Bearer <admin_jwt_token>
```

---

## 🔍 **Get All Users with Filters**

### Basic Get All Users

```http
GET /api/users/admin/all
```

**Response:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "isActive": true,
      "isVerified": true,
      "phoneNumber": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

### Search Users by Name/Email

```http
GET /api/users/admin/all?search=john
```

### Filter by Active Status

```http
GET /api/users/admin/all?isActive=true
```

### Filter by Verification Status

```http
GET /api/users/admin/all?isVerified=false
```

### Filter by Role

```http
GET /api/users/admin/all?role=admin
```

### Combined Filters with Pagination

```http
GET /api/users/admin/all?search=john&isActive=true&isVerified=false&page=1&limit=20
```

---

## 👤 **User Management Actions**

### Set User as Verified

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/verify
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isVerified": true
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "isVerified": true,
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Block User Account

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isActive": false
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "isActive": false,
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Activate User Account

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "isActive": true
}
```

### Resend Verification Code

```http
POST /api/users/123e4567-e89b-12d3-a456-426614174000/resend-verification
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "message": "Verification code has been sent to john.doe@example.com",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "isVerified": false
  }
}
```

---

## 📊 **User Statistics**

### Get User Statistics

```http
GET /api/users/stats
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "inactiveUsers": 30,
  "verifiedUsers": 100,
  "unverifiedUsers": 50
}
```

---

## 🔧 **General User Operations**

### Get User by ID

```http
GET /api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "customer",
  "isActive": true,
  "isVerified": true,
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update User Information

```http
PATCH /api/users/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "firstName": "Updated Name",
  "lastName": "Updated Last Name",
  "phoneNumber": "+1987654321"
}
```

### Soft Delete User

```http
DELETE /api/users/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
```

### Restore Soft Deleted User

```http
PUT /api/users/123e4567-e89b-12d3-a456-426614174000/restore
Authorization: Bearer <admin_token>
```

---

## ⚠️ **Error Responses**

### User Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

### Unauthorized Access

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden Access (Not Admin)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Bad Request (Missing Required Field)

```json
{
  "statusCode": 400,
  "message": "isVerified field is required",
  "error": "Bad Request"
}
```

### User Already Verified

```json
{
  "statusCode": 400,
  "message": "User with ID 123e4567-e89b-12d3-a456-426614174000 is already verified",
  "error": "Bad Request"
}
```

---

## 📝 **Important Notes**

### 1. Authentication

- All admin endpoints require `Bearer` token in Authorization header
- User must have `admin` or `super_admin` role
- Token must be valid and not expired

### 2. Pagination

- Default page: 1
- Default limit: 10
- Maximum limit: 100
- Use `page` and `limit` query parameters

### 3. Search & Filters

- Search works on: firstName, lastName, email
- Filters are case-sensitive for exact matches
- Multiple filters can be combined
- Empty search returns all users

### 4. User Status Management

- `isActive: false` = User is blocked/cannot login
- `isVerified: false` = User needs email verification
- Both can be changed independently

### 5. Soft Delete

- Deleted users are marked as deleted but not removed from database
- Can be restored using the restore endpoint
- Deleted users won't appear in normal queries

---

## 🚀 **Quick Admin Panel Examples**

### Get Recent Unverified Users

```http
GET /api/users/admin/all?isVerified=false&page=1&limit=10
```

### Search for Inactive Customers

```http
GET /api/users/admin/all?search=customer&isActive=false&role=customer
```

### Block Multiple Users (Batch Operation)

```javascript
// Frontend example
const userIds = ['user1', 'user2', 'user3'];

userIds.forEach(async (userId) => {
  await fetch(`/api/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive: false }),
  });
});
```

### Dashboard Statistics

```javascript
// Get stats for dashboard
const stats = await fetch('/api/users/stats', {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// Get recent users
const recentUsers = await fetch('/api/users/admin/all?page=1&limit=5', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
```

### User Management Workflow

```javascript
// 1. Find user
const users = await fetch('/api/users/admin/all?search=john@example.com');

// 2. Verify user
await fetch(`/api/users/${userId}/verify`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: JSON.stringify({ isVerified: true }),
});

// 3. Activate user
await fetch(`/api/users/${userId}/status`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${adminToken}` },
  body: JSON.stringify({ isActive: true }),
});
```
