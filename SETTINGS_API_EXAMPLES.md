# Settings API Examples

## Overview

The Settings module provides endpoints to manage application-wide settings including social media links and delivery costs. All endpoints require SuperAdmin role authentication.

## Base URL

```
http://localhost:3000/api/v1/settings
```

## Authentication

All settings endpoints require JWT authentication with SuperAdmin role:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get Social Media Links

**GET** `/social`

Retrieves the current social media links configuration.

### Response

```json
{
  "facebook": "https://facebook.com/rabetalkhayal",
  "instagram": "https://instagram.com/rabetalkhayal",
  "twitter": "https://twitter.com/rabetalkhayal",
  "linkedin": "https://linkedin.com/company/rabetalkhayal",
  "youtube": "https://youtube.com/rabetalkhayal",
  "tiktok": "https://tiktok.com/@rabetalkhayal",
  "whatsapp": "https://wa.me/966501234567",
  "telegram": "https://t.me/rabetalkhayal"
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/v1/settings/social" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 2. Update Social Media Links

**PUT** `/social`

Updates the social media links. All fields are optional - only provided fields will be updated.

### Request Body

```json
{
  "facebook": "https://facebook.com/rabetalkhayal",
  "instagram": "https://instagram.com/rabetalkhayal",
  "twitter": "https://twitter.com/rabetalkhayal",
  "linkedin": "https://linkedin.com/company/rabetalkhayal",
  "youtube": "https://youtube.com/rabetalkhayal",
  "tiktok": "https://tiktok.com/@rabetalkhayal",
  "whatsapp": "https://wa.me/966501234567",
  "telegram": "https://t.me/rabetalkhayal"
}
```

### Response

```json
{
  "facebook": "https://facebook.com/rabetalkhayal",
  "instagram": "https://instagram.com/rabetalkhayal",
  "twitter": "https://twitter.com/rabetalkhayal",
  "linkedin": "https://linkedin.com/company/rabetalkhayal",
  "youtube": "https://youtube.com/rabetalkhayal",
  "tiktok": "https://tiktok.com/@rabetalkhayal",
  "whatsapp": "https://wa.me/966501234567",
  "telegram": "https://t.me/rabetalkhayal"
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/v1/settings/social" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facebook": "https://facebook.com/rabetalkhayal",
    "instagram": "https://instagram.com/rabetalkhayal",
    "twitter": "https://twitter.com/rabetalkhayal"
  }'
```

---

## 3. Get Delivery Costs

**GET** `/delivery`

Retrieves the current delivery costs configuration.

### Response

```json
{
  "deliveryCosts": [
    {
      "name": "Standard Delivery",
      "cost": 15.0
    },
    {
      "name": "Express Delivery",
      "cost": 25.0
    },
    {
      "name": "Same Day Delivery",
      "cost": 35.0
    },
    {
      "name": "Free Delivery",
      "cost": 0.0
    }
  ]
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/v1/settings/delivery" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 4. Update Delivery Costs

**PUT** `/delivery`

Updates the delivery costs configuration. This will replace all existing delivery costs with the new array.

### Request Body

```json
{
  "deliveryCosts": [
    {
      "name": "Standard Delivery",
      "cost": 15.0
    },
    {
      "name": "Express Delivery",
      "cost": 25.0
    },
    {
      "name": "Same Day Delivery",
      "cost": 35.0
    },
    {
      "name": "Free Delivery",
      "cost": 0.0
    }
  ]
}
```

### Response

```json
{
  "deliveryCosts": [
    {
      "name": "Standard Delivery",
      "cost": 15.0
    },
    {
      "name": "Express Delivery",
      "cost": 25.0
    },
    {
      "name": "Same Day Delivery",
      "cost": 35.0
    },
    {
      "name": "Free Delivery",
      "cost": 0.0
    }
  ]
}
```

### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/v1/settings/delivery" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryCosts": [
      {
        "name": "Standard Delivery",
        "cost": 15.00
      },
      {
        "name": "Express Delivery",
        "cost": 25.00
      }
    ]
  }'
```

---

## 5. Get All Settings

**GET** `/`

Retrieves all settings including both social media links and delivery costs.

### Response

```json
{
  "socialLinks": {
    "facebook": "https://facebook.com/rabetalkhayal",
    "instagram": "https://instagram.com/rabetalkhayal",
    "twitter": "https://twitter.com/rabetalkhayal",
    "linkedin": "https://linkedin.com/company/rabetalkhayal",
    "youtube": "https://youtube.com/rabetalkhayal",
    "tiktok": "https://tiktok.com/@rabetalkhayal",
    "whatsapp": "https://wa.me/966501234567",
    "telegram": "https://t.me/rabetalkhayal"
  },
  "deliveryCosts": {
    "deliveryCosts": [
      {
        "name": "Standard Delivery",
        "cost": 15.0
      },
      {
        "name": "Express Delivery",
        "cost": 25.0
      },
      {
        "name": "Same Day Delivery",
        "cost": 35.0
      },
      {
        "name": "Free Delivery",
        "cost": 0.0
      }
    ]
  }
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/v1/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "cost must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request"
}
```

---

## Data Validation Rules

### Social Media Links

- All fields are optional strings
- URLs should be valid social media profile/page URLs
- Fields can be null or empty strings

### Delivery Costs

- `deliveryCosts` must be an array
- Each item must have:
  - `name`: Required string (delivery option name)
  - `cost`: Required number >= 0 (delivery cost in currency units)
- At least one delivery cost option should be provided

---

## Notes

1. **Singleton Pattern**: The settings use a singleton pattern, meaning there's only one settings record in the database that gets updated.

2. **Partial Updates**: For social media links, you can update only specific fields without affecting others.

3. **Complete Replacement**: For delivery costs, the entire array is replaced when updating.

4. **SuperAdmin Only**: All endpoints require SuperAdmin role authentication.

5. **Real-time Updates**: Changes to settings are immediately reflected in the application.
