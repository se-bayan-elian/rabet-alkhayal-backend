# Users API Documentation - Admin Panel

## Overview

This document provides comprehensive API documentation for the Users module, specifically designed for admin panel usage. All endpoints require authentication and admin/super-admin privileges.

## Authentication

All endpoints require:

- **Bearer Token**: `Authorization: Bearer <jwt_token>`
- **Role**: Admin or SuperAdmin

## Base URL

```
/api/users
```

---

## 📋 **Admin User Management Endpoints**

### 1. Get All Users with Advanced Filters

**GET** `/admin/all`

Get all users with advanced filtering, searching, and pagination capabilities.

#### Query Parameters

| Parameter    | Type    | Required | Description                               | Example    |
| ------------ | ------- | -------- | ----------------------------------------- | ---------- |
| `search`     | string  | No       | Search by email, first name, or last name | `john`     |
| `isActive`   | boolean | No       | Filter by active status                   | `true`     |
| `isVerified` | boolean | No       | Filter by verification status             | `false`    |
| `role`       | enum    | No       | Filter by user role                       | `customer` |
| `page`       | number  | No       | Page number (default: 1)                  | `1`        |
| `limit`      | number  | No       | Items per page (default: 10, max: 100)    | `20`       |

#### Example Requests

```bash
# Get all users (paginated)
GET /api/users/admin/all

# Search users by name/email
GET /api/users/admin/all?search=john

# Get only active users
GET /api/users/admin/all?isActive=true

# Get unverified users
GET /api/users/admin/all?isVerified=false

# Get admin users only
GET /api/users/admin/all?role=admin

# Combined filters with pagination
GET /api/users/admin/all?search=john&isActive=true&page=1&limit=20
```

#### Response Format

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
      "address": "123 Main St",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

---

### 2. Set User Verification Status

**PUT** `/:id/verify`

Manually set a user's verification status.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

#### Request Body

```json
{
  "isVerified": true
}
```

#### Example Request

```bash
curl -X PUT /api/users/123e4567-e89b-12d3-a456-426614174000/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isVerified": true}'
```

#### Response

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

---

### 3. Set User Active/Inactive Status

**PUT** `/:id/status`

Block or activate a user account.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

#### Request Body

```json
{
  "isActive": false
}
```

#### Example Request

```bash
# Block user
curl -X PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Activate user
curl -X PUT /api/users/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

#### Response

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

---

### 4. Resend Verification Code

**POST** `/:id/resend-verification`

Resend verification email to a user.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

#### Example Request

```bash
curl -X POST /api/users/123e4567-e89b-12d3-a456-426614174000/resend-verification \
  -H "Authorization: Bearer <token>"
```

#### Response

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

## 📊 **General User Management Endpoints**

### 5. Get All Users (Advanced)

**GET** `/`

Get all users with advanced filtering, sorting, and pagination.

#### Query Parameters

| Parameter    | Type   | Required | Description                                                       |
| ------------ | ------ | -------- | ----------------------------------------------------------------- |
| `pagination` | object | No       | `{"page": 1, "limit": 10}`                                        |
| `sort`       | array  | No       | `[{"field": "createdAt", "direction": "DESC"}]`                   |
| `filters`    | array  | No       | `[{"field": "isActive", "operator": "eq", "value": true}]`        |
| `search`     | object | No       | `{"query": "john", "fields": ["firstName", "lastName", "email"]}` |
| `relations`  | array  | No       | Relations to include                                              |

#### Example Request

```bash
GET /api/users?pagination={"page":1,"limit":10}&sort=[{"field":"createdAt","direction":"DESC"}]&filters=[{"field":"isActive","operator":"eq","value":true}]
```

---

### 6. Search Users

**GET** `/search`

Search users by name or email.

#### Query Parameters

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `q`       | string | Yes      | Search query |

#### Example Request

```bash
GET /api/users/search?q=john%20doe
```

---

### 7. Get Active Users

**GET** `/active`

Get all active users.

#### Example Request

```bash
GET /api/users/active?page=1&limit=10
```

---

### 8. Get User Statistics

**GET** `/stats`

Get comprehensive user statistics.

#### Example Request

```bash
GET /api/users/stats
```

#### Response

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

### 9. Get Users by Role

**GET** `/role/:role`

Get users by specific role.

#### Path Parameters

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| `role`    | string | Yes      | User role (customer, admin) |

#### Example Request

```bash
GET /api/users/role/customer?page=1&limit=10
```

---

### 10. Get User by ID

**GET** `/:id`

Get a specific user by ID.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

#### Example Request

```bash
GET /api/users/123e4567-e89b-12d3-a456-426614174000
```

---

### 11. Update User

**PATCH** `/:id`

Update user information.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

#### Request Body

```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last Name",
  "phoneNumber": "+1987654321"
}
```

#### Example Request

```bash
curl -X PATCH /api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Updated Name"}'
```

---

### 12. Delete User (Soft Delete)

**DELETE** `/:id`

Soft delete a user.

#### Example Request

```bash
curl -X DELETE /api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### 13. Restore User

**PUT** `/:id/restore`

Restore a soft deleted user.

#### Example Request

```bash
curl -X PUT /api/users/123e4567-e89b-12d3-a456-426614174000/restore \
  -H "Authorization: Bearer <token>"
```

---

## 🔐 **Security & Permissions**

### Required Permissions

- **SuperAdmin**: Full access to all endpoints
- **Admin**: Access to admin endpoints and general user management

### Authentication Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📝 **Common Response Codes**

| Status Code | Description           |
| ----------- | --------------------- |
| `200`       | Success               |
| `201`       | Created               |
| `204`       | No Content            |
| `400`       | Bad Request           |
| `401`       | Unauthorized          |
| `403`       | Forbidden             |
| `404`       | Not Found             |
| `500`       | Internal Server Error |

---

## 🎯 **Best Practices for Admin Panel**

### 1. User Management Workflow

```javascript
// 1. Get users with filters
const users = await fetch(
  '/api/users/admin/all?search=john&isActive=true&page=1&limit=20',
);

// 2. Update user status if needed
await fetch(`/api/users/${userId}/status`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ isActive: false }),
});

// 3. Verify user if needed
await fetch(`/api/users/${userId}/verify`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ isVerified: true }),
});
```

### 2. Bulk Operations

```javascript
// Get statistics first
const stats = await fetch('/api/users/stats');

// Then perform bulk actions based on stats
if (stats.unverifiedUsers > 0) {
  // Handle unverified users
}
```

### 3. Search and Filter Combinations

```javascript
// Combine multiple filters for targeted results
const filters = {
  search: 'john',
  isActive: true,
  isVerified: false,
  role: 'customer',
  page: 1,
  limit: 50,
};

const queryString = new URLSearchParams(filters).toString();
const users = await fetch(`/api/users/admin/all?${queryString}`);
```

---

## 🚀 **Quick Start Examples**

### Get Recent Users

```bash
GET /api/users/admin/all?page=1&limit=10
```

### Find Inactive Users

```bash
GET /api/users/admin/all?isActive=false
```

### Search by Email

```bash
GET /api/users/admin/all?search=user@example.com
```

### Get User Stats

```bash
GET /api/users/stats
```

This documentation provides everything needed to effectively manage users through the admin panel with comprehensive filtering, searching, and user status management capabilities.
