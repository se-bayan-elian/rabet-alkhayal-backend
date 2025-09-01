# Coupons API Documentation

## Overview

The Coupons API provides comprehensive coupon management functionality for administrators. It supports creating, reading, updating, and deleting coupons with various discount types and usage restrictions.

## Authentication

All coupon endpoints require authentication with an admin role:

- **Authorization**: Bearer Token
- **Required Role**: Admin
- **Header**: `Authorization: Bearer <your-jwt-token>`

### Authentication Errors

| Status Code        | Description                                    |
| ------------------ | ---------------------------------------------- |
| `401 Unauthorized` | Invalid or missing authentication token        |
| `403 Forbidden`    | Insufficient permissions - Admin role required |

### Example Authorization Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Base URL

```
/api/coupons
```

## Endpoints

### 1. Create Coupon

**POST** `/coupons`

Creates a new coupon with specified discount and usage parameters.

#### Request Body

```json
{
  "code": "SAVE20",
  "description": "Save 20% on your order",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 100.0,
  "maximumDiscountAmount": 50.0,
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2024-12-31T23:59:59.999Z"
}
```

#### Parameters

| Field                   | Type    | Required | Description                              | Example                      |
| ----------------------- | ------- | -------- | ---------------------------------------- | ---------------------------- |
| `code`                  | string  | Yes      | Unique coupon code (3-50 chars)          | `"SAVE20"`                   |
| `description`           | string  | No       | Coupon description                       | `"Save 20% on your order"`   |
| `discountType`          | enum    | Yes      | `"percentage"` or `"fixed"`              | `"percentage"`               |
| `discountValue`         | number  | Yes      | Discount value (0-100 for percentage)    | `20`                         |
| `minimumOrderAmount`    | number  | No       | Minimum order amount required            | `100.0`                      |
| `maximumDiscountAmount` | number  | No       | Max discount for percentage type         | `50.0`                       |
| `usageLimit`            | number  | No       | Total usage limit                        | `100`                        |
| `usageLimitPerUser`     | number  | No       | Usage limit per user                     | `1`                          |
| `isActive`              | boolean | No       | Whether coupon is active (default: true) | `true`                       |
| `startDate`             | string  | Yes      | Start date (ISO format)                  | `"2024-01-01T00:00:00.000Z"` |
| `expiryDate`            | string  | Yes      | Expiry date (ISO format)                 | `"2024-12-31T23:59:59.999Z"` |

#### Response (201 Created)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SAVE20",
  "description": "Save 20% on your order",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 100.0,
  "maximumDiscountAmount": 50.0,
  "usageLimit": 100,
  "usedCount": 0,
  "usageLimitPerUser": 1,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2024-12-31T23:59:59.999Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isExpired": false,
  "isValid": true,
  "remainingUsage": 100
}
```

#### Error Responses

- **400 Bad Request**: Invalid data or duplicate coupon code
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions (not admin)

---

### 2. Get All Coupons

**GET** `/coupons`

Retrieves all coupons with optional filtering.

#### Query Parameters

| Parameter  | Type    | Description                                 | Example  |
| ---------- | ------- | ------------------------------------------- | -------- |
| `isActive` | boolean | Filter by active status                     | `true`   |
| `isValid`  | boolean | Filter by validity (active and not expired) | `true`   |
| `search`   | string  | Search by coupon code or description        | `"SAVE"` |

#### Examples

```
GET /coupons
GET /coupons?isActive=true
GET /coupons?isValid=true
GET /coupons?search=SAVE
GET /coupons?isActive=true&isValid=true&search=20
```

#### Response (200 OK)

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": "SAVE20",
    "description": "Save 20% on your order",
    "discountType": "percentage",
    "discountValue": 20,
    "minimumOrderAmount": 100.0,
    "maximumDiscountAmount": 50.0,
    "usageLimit": 100,
    "usedCount": 25,
    "usageLimitPerUser": 1,
    "isActive": true,
    "startDate": "2024-01-01T00:00:00.000Z",
    "expiryDate": "2024-12-31T23:59:59.999Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isExpired": false,
    "isValid": true,
    "remainingUsage": 75
  }
]
```

---

### 3. Get Coupon by ID

**GET** `/coupons/{id}`

Retrieves a specific coupon by its ID.

#### Path Parameters

| Parameter | Type   | Description      | Example                                  |
| --------- | ------ | ---------------- | ---------------------------------------- |
| `id`      | string | Coupon ID (UUID) | `"123e4567-e89b-12d3-a456-426614174000"` |

#### Example

```
GET /coupons/123e4567-e89b-12d3-a456-426614174000
```

#### Response (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SAVE20",
  "description": "Save 20% on your order",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 100.0,
  "maximumDiscountAmount": 50.0,
  "usageLimit": 100,
  "usedCount": 25,
  "usageLimitPerUser": 1,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2024-12-31T23:59:59.999Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "isExpired": false,
  "isValid": true,
  "remainingUsage": 75
}
```

#### Error Responses

- **404 Not Found**: Coupon not found

---

### 4. Get Coupon by Code

**GET** `/coupons/code/{code}`

Retrieves a specific coupon by its code.

#### Path Parameters

| Parameter | Type   | Description | Example    |
| --------- | ------ | ----------- | ---------- |
| `code`    | string | Coupon code | `"SAVE20"` |

#### Example

```
GET /coupons/code/SAVE20
```

#### Response (200 OK)

Same as Get Coupon by ID response.

#### Error Responses

- **404 Not Found**: Coupon not found

---

### 5. Update Coupon

**PATCH** `/coupons/{id}`

Updates an existing coupon with partial data.

#### Path Parameters

| Parameter | Type   | Description      | Example                                  |
| --------- | ------ | ---------------- | ---------------------------------------- |
| `id`      | string | Coupon ID (UUID) | `"123e4567-e89b-12d3-a456-426614174000"` |

#### Request Body

```json
{
  "description": "Updated coupon description",
  "discountValue": 25,
  "usageLimit": 200,
  "isActive": false
}
```

#### Response (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "SAVE20",
  "description": "Updated coupon description",
  "discountType": "percentage",
  "discountValue": 25,
  "minimumOrderAmount": 100.0,
  "maximumDiscountAmount": 50.0,
  "usageLimit": 200,
  "usedCount": 25,
  "usageLimitPerUser": 1,
  "isActive": false,
  "startDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2024-12-31T23:59:59.999Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-20T15:45:00.000Z",
  "isExpired": false,
  "isValid": false,
  "remainingUsage": 175
}
```

#### Error Responses

- **400 Bad Request**: Invalid data
- **404 Not Found**: Coupon not found

---

### 6. Delete Coupon

**DELETE** `/coupons/{id}`

Deletes a coupon permanently.

#### Path Parameters

| Parameter | Type   | Description      | Example                                  |
| --------- | ------ | ---------------- | ---------------------------------------- |
| `id`      | string | Coupon ID (UUID) | `"123e4567-e89b-12d3-a456-426614174000"` |

#### Example

```
DELETE /coupons/123e4567-e89b-12d3-a456-426614174000
```

#### Response (204 No Content)

No response body.

#### Error Responses

- **404 Not Found**: Coupon not found

---

### 7. Get Coupon Statistics

**GET** `/coupons/{id}/stats`

Retrieves usage statistics for a specific coupon.

#### Path Parameters

| Parameter | Type   | Description      | Example                                  |
| --------- | ------ | ---------------- | ---------------------------------------- |
| `id`      | string | Coupon ID (UUID) | `"123e4567-e89b-12d3-a456-426614174000"` |

#### Example

```
GET /coupons/123e4567-e89b-12d3-a456-426614174000/stats
```

#### Response (200 OK)

```json
{
  "totalUsage": 25,
  "remainingUsage": 75,
  "usageRate": 25.0,
  "totalDiscountGiven": 1250.75,
  "averageOrderValue": 120.5
}
```

#### Error Responses

- **404 Not Found**: Coupon not found

## Data Types

### DiscountType Enum

- `percentage`: Percentage discount (0-100%)
- `fixed`: Fixed amount discount

### Coupon Entity Fields

| Field                   | Type         | Description                          |
| ----------------------- | ------------ | ------------------------------------ |
| `id`                    | string       | Unique identifier (UUID)             |
| `code`                  | string       | Unique coupon code                   |
| `description`           | string       | Optional description                 |
| `discountType`          | DiscountType | Type of discount                     |
| `discountValue`         | number       | Discount value                       |
| `minimumOrderAmount`    | number       | Minimum order amount required        |
| `maximumDiscountAmount` | number       | Maximum discount for percentage type |
| `usageLimit`            | number       | Total usage limit                    |
| `usedCount`             | number       | Number of times used                 |
| `usageLimitPerUser`     | number       | Usage limit per user                 |
| `isActive`              | boolean      | Whether coupon is active             |
| `startDate`             | Date         | Coupon start date                    |
| `expiryDate`            | Date         | Coupon expiry date                   |
| `createdAt`             | Date         | Creation timestamp                   |
| `updatedAt`             | Date         | Last update timestamp                |
| `isExpired`             | boolean      | Computed: whether coupon is expired  |
| `isValid`               | boolean      | Computed: whether coupon is valid    |
| `remainingUsage`        | number       | Computed: remaining usage count      |

## Security

### Authentication Mechanism

- **Type**: JWT (JSON Web Token) Bearer Authentication
- **Token Location**: HTTP Authorization header
- **Token Format**: `Bearer <token>`

### Authorization Levels

- **Required Role**: `ADMIN`
- **Access Control**: Role-based access control (RBAC)
- **Guard Chain**: `JwtAuthGuard` → `RolesGuard`

### Security Features

- **Token Validation**: Automatic token expiration and signature verification
- **Role Verification**: Server-side role checking on each request
- **Request Logging**: Authentication attempts are logged for security monitoring
- **Error Handling**: Comprehensive error responses for auth failures

### Token Management

- **Expiration**: Tokens expire after a configured time period
- **Refresh**: Implement token refresh mechanism for long-lived sessions
- **Revocation**: Tokens can be invalidated server-side if needed

### Rate Limiting

Consider implementing rate limiting to prevent abuse:

- **Recommendation**: 100 requests per minute per admin user
- **Implementation**: Use `@nestjs/throttler` or similar middleware

## Usage Examples

### Creating a Percentage Discount Coupon

```bash
curl -X POST http://localhost:3000/api/coupons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "description": "Welcome discount for new customers",
    "discountType": "percentage",
    "discountValue": 20,
    "minimumOrderAmount": 50.0,
    "maximumDiscountAmount": 30.0,
    "usageLimit": 1000,
    "usageLimitPerUser": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "expiryDate": "2024-12-31T23:59:59.999Z"
  }'
```

### Creating a Fixed Amount Discount Coupon

```bash
curl -X POST http://localhost:3000/api/coupons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FIXED10",
    "description": "Fixed $10 discount",
    "discountType": "fixed",
    "discountValue": 10.0,
    "minimumOrderAmount": 25.0,
    "usageLimit": 500,
    "startDate": "2024-01-01T00:00:00.000Z",
    "expiryDate": "2024-12-31T23:59:59.999Z"
  }'
```

### Filtering Active Coupons

```bash
curl -X GET "http://localhost:3000/api/coupons?isActive=true&isValid=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Searching Coupons

```bash
curl -X GET "http://localhost:3000/api/coupons?search=SAVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
