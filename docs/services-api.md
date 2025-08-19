# Services API Documentation

## Authentication

### Admin Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Services

### Get All Services (Public)

```http
GET /services
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `lang` (optional): Language code (en/ar) (default: en)

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Web Development",
      "description": "Full-stack web development services",
      "icon": "https://example.com/icons/web-dev.png",
      "image": "https://example.com/images/web-dev.jpg",
      "isActive": true,
      "displayOrder": 1,
      "projects": [],
      "pricingPlans": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Get Service by ID (Public)

```http
GET /services/{id}
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "nameEn": "Web Development",
  "nameAr": "تطوير المواقع",
  "descriptionEn": "Full-stack web development services",
  "descriptionAr": "خدمات تطوير المواقع المتكاملة",
  "icon": "https://example.com/icons/web-dev.png",
  "image": "https://example.com/images/web-dev.jpg",
  "isActive": true,
  "displayOrder": 1,
  "projects": [
    {
      "id": "uuid",
      "title": "Project Name",
      "description": "Project Description",
      "imageUrl": "https://example.com/projects/1.jpg"
    }
  ],
  "pricingPlans": [
    {
      "id": "uuid",
      "name": "Basic Plan",
      "price": 99.99,
      "features": [
        {
          "id": "uuid",
          "name": "Feature 1",
          "description": "Feature description"
        }
      ]
    }
  ]
}
```

### Get Service Projects (Public)

```http
GET /services/{id}/projects
```

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "title": "Project Name",
    "description": "Project Description",
    "imageUrl": "https://example.com/projects/1.jpg"
  }
]
```

### Get Service Pricing Plans (Public)

```http
GET /services/{id}/pricing-plans
```

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "name": "Basic Plan",
    "price": 99.99,
    "features": [
      {
        "id": "uuid",
        "name": "Feature 1",
        "description": "Feature description"
      }
    ]
  }
]
```

### Submit Contact Form (Public)

```http
POST /services/contact
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "serviceId": "uuid",
  "message": "I'm interested in your web development services"
}
```

**Response (200 OK):**

```json
{
  "message": "Thank you for your inquiry! We will get back to you soon."
}
```

### Create Service (Admin Only)

```http
POST /services
```

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "nameEn": "Web Development",
  "nameAr": "تطوير المواقع",
  "descriptionEn": "Full web development services",
  "descriptionAr": "خدمات تطوير المواقع المتكاملة",
  "icon": "icon-url",
  "image": "image-url",
  "projects": [
    {
      "title": "Project 1",
      "description": "Project description",
      "imageUrl": "image-url"
    }
  ],
  "pricingPlans": [
    {
      "name": "Basic Plan",
      "price": 99.99,
      "features": [
        {
          "name": "Feature 1",
          "description": "Feature description"
        }
      ]
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "nameEn": "Web Development",
  "nameAr": "تطوير المواقع",
  "descriptionEn": "Full web development services",
  "descriptionAr": "خدمات تطوير المواقع المتكاملة",
  "icon": "icon-url",
  "image": "image-url",
  "isActive": true,
  "displayOrder": 1,
  "projects": [...],
  "pricingPlans": [...]
}
```

### Get All Services (Admin)

```http
GET /services/admin/all
```

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "nameEn": "Web Development",
    "nameAr": "تطوير المواقع",
    "descriptionEn": "Full web development services",
    "descriptionAr": "خدمات تطوير المواقع المتكاملة",
    "icon": "icon-url",
    "image": "image-url",
    "isActive": true,
    "displayOrder": 1,
    "projects": [...],
    "pricingPlans": [...]
  }
]
```

### Update Service (Admin Only)

```http
PATCH /services/{id}
```

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:**

```json
{
  "nameEn": "Updated Web Development",
  "nameAr": "تطوير المواقع المحدث",
  "isActive": true
}
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "nameEn": "Updated Web Development",
  "nameAr": "تطوير المواقع المحدث",
  "isActive": true,
  ...
}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Service not found",
  "error": "Not Found"
}
```
