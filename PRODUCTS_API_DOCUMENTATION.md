# Products API Documentation

## Overview

This document provides comprehensive API documentation for the Products module, designed for front
end developers working on the admin dashboard. The API supports full CRUD operations for products with advanced features like product options, option values, filtering, and search.

## Base URL

```
/api/v1/products
```

## Authentication

All admin endpoints require JWT authentication with admin role:

```
Authorization: Bearer <admin-jwt-token>
```

## Data Structures

### Product Entity

```typescript
interface Product {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  weight: number;
  subcategoryId: string;
  subcategory?: Subcategory;
  options?: ProductOption[];
  cartItems?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Option

```typescript
interface ProductOption {
  id: string;
  productId: string;
  name: string;
  type: 'SELECT' | 'TEXT' | 'NOTE' | 'CHECKBOX' | 'IMAGE';
  required: boolean;
  product?: Product;
  values?: ProductOptionValue[];
  cartCustomizations?: CartCustomization[];
}
```

### Product Option Value

```typescript
interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  extraPrice: number;
  option?: ProductOption;
}
```

## API Endpoints

### 1. Create Product

**POST** `/api/v1/products`

Creates a new product with options and option values.

**Request Body:**

```json
{
  "name": "iPhone 15 Pro",
  "originalPrice": 999.99,
  "discountedPrice": 899.99,
  "weight": 0.2,
  "subcategoryId": "123e4567-e89b-12d3-a456-426614174000",
  "options": [
    {
      "name": "Color",
      "type": "SELECT",
      "required": true,
      "values": [
        {
          "value": "Space Black",
          "extraPrice": 0
        },
        {
          "value": "Natural Titanium",
          "extraPrice": 50
        }
      ]
    },
    {
      "name": "Storage",
      "type": "SELECT",
      "required": true,
      "values": [
        {
          "value": "128GB",
          "extraPrice": 0
        },
        {
          "value": "256GB",
          "extraPrice": 100
        },
        {
          "value": "512GB",
          "extraPrice": 300
        }
      ]
    }
  ]
}
```

**Response (201):**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "iPhone 15 Pro",
  "originalPrice": 999.99,
  "discountedPrice": 899.99,
  "weight": 0.2,
  "subcategoryId": "123e4567-e89b-12d3-a456-426614174000",
  "subcategory": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Smartphones",
    "description": "Mobile phones and smartphones"
  },
  "options": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Color",
      "type": "SELECT",
      "required": true,
      "values": [
        {
          "id": "012e3456-e89b-12d3-a456-426614174003",
          "value": "Space Black",
          "extraPrice": 0
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get All Products

**GET** `/api/v1/products`

Retrieves products with advanced filtering, sorting, and pagination.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort options as JSON string
- `filters`: Filter options as JSON string
- `search`: Search query
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `subcategoryId`: Filter by subcategory ID

**Examples:**

```bash
# Basic pagination
GET /api/v1/products?page=1&limit=20

# Search products
GET /api/v1/products?search=iPhone

# Filter by price range
GET /api/v1/products?minPrice=100&maxPrice=1000

# Filter by subcategory
GET /api/v1/products?subcategoryId=123e4567-e89b-12d3-a456-426614174000

# Advanced sorting
GET /api/v1/products?sort=[{"field":"createdAt","direction":"DESC"}]

# Advanced filtering
GET /api/v1/products?filters=[{"field":"subcategoryId","operator":"eq","value":"123e4567-e89b-12d3-a456-426614174000"}]
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "iPhone 15 Pro",
      "originalPrice": 999.99,
      "discountedPrice": 899.99,
      "weight": 0.2,
      "subcategory": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Smartphones"
      },
      "options": [
        {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "name": "Color",
          "type": "SELECT",
          "required": true,
          "values": [
            {
              "id": "012e3456-e89b-12d3-a456-426614174003",
              "value": "Space Black",
              "extraPrice": 0
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 3. Get Product by ID

**GET** `/api/v1/products/:id`

Retrieves a single product with full details.

**Response (200):**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "iPhone 15 Pro",
  "originalPrice": 999.99,
  "discountedPrice": 899.99,
  "weight": 0.2,
  "subcategoryId": "123e4567-e89b-12d3-a456-426614174000",
  "subcategory": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Smartphones",
    "description": "Mobile phones and smartphones"
  },
  "options": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Color",
      "type": "SELECT",
      "required": true,
      "values": [
        {
          "id": "012e3456-e89b-12d3-a456-426614174003",
          "value": "Space Black",
          "extraPrice": 0
        },
        {
          "id": "345e6789-e89b-12d3-a456-426614174004",
          "value": "Natural Titanium",
          "extraPrice": 50
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Update Product

**PATCH** `/api/v1/products/:id`

Updates an existing product. Supports partial updates.

**Request Body:**

```json
{
  "name": "iPhone 15 Pro Max",
  "discountedPrice": 1099.99,
  "options": [
    {
      "name": "Color",
      "type": "SELECT",
      "required": true,
      "values": [
        {
          "value": "Space Black",
          "extraPrice": 0
        },
        {
          "value": "Blue Titanium",
          "extraPrice": 50
        }
      ]
    }
  ]
}
```

**Response (200):** Same as GET product response

### 5. Delete Product

**DELETE** `/api/v1/products/:id`

Soft deletes a product (Admin only).

**Response (204):** No content

### 6. Restore Product

**PUT** `/api/v1/products/:id/restore`

Restores a soft deleted product (Admin only).

**Response (200):**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "iPhone 15 Pro"
  // ... restored product data
}
```

### 7. Get Products by Subcategory

**GET** `/api/v1/products/subcategory/:subcategoryId`

Retrieves all products in a specific subcategory.

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `sort`: Sort options
- `filters`: Additional filters
- `search`: Search within subcategory

**Response (200):** Same as GET all products

### 8. Get Featured Products

**GET** `/api/v1/products/featured`

Retrieves featured products for homepage display.

**Query Parameters:**

- `mode`: "manual" (by isFeatured flag) or "auto" (by most sold) - default: "manual"
- `limit`: Maximum number of products (max: 8) - default: 8

**Response (200):**

```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "iPhone 15 Pro",
    "originalPrice": 999.99,
    "discountedPrice": 899.99,
    "weight": 0.2,
    "subcategory": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Smartphones"
    }
  }
]
```

## Product Option Types

### SELECT Options

Used for predefined choices like colors, sizes, storage capacity.

**Example:**

```json
{
  "name": "Color",
  "type": "SELECT",
  "required": true,
  "values": [
    {
      "value": "Red",
      "extraPrice": 0
    },
    {
      "value": "Blue",
      "extraPrice": 10
    }
  ]
}
```

### TEXT Options

Used for custom text input like engraving, personalization.

**Example:**

```json
{
  "name": "Engraving",
  "type": "TEXT",
  "required": false,
  "values": [] // No predefined values for TEXT options
}
```

### NOTE Options

Used for additional information or notes.

**Example:**

```json
{
  "name": "Special Instructions",
  "type": "NOTE",
  "required": false,
  "values": [] // No predefined values for NOTE options
}
```

### CHECKBOX Options

Used for boolean choices or multiple selections.

**Example:**

```json
{
  "name": "Addons",
  "type": "CHECKBOX",
  "required": false,
  "values": [
    {
      "value": "Extended Warranty",
      "extraPrice": 50
    },
    {
      "value": "Premium Support",
      "extraPrice": 25
    }
  ]
}
```

### IMAGE Options

Used for image-based selections or visual customizations.

**Example:**

```json
{
  "name": "Design Pattern",
  "type": "IMAGE",
  "required": true,
  "values": [
    {
      "value": "Floral Pattern",
      "extraPrice": 20
    },
    {
      "value": "Geometric Pattern",
      "extraPrice": 15
    }
  ]
}
```

## Image Upload Guidelines

**Note:** Product option values no longer support images. Images are handled at the product level or through other means. The IMAGE option type is used for visual selections but does not store images in the option values themselves.

### Product Images

- **Format**: PNG, JPEG, JPG
- **Max Size**: 5MB
- **Recommended Dimensions**: 800x600px for product images
- **Naming Convention**: `products/{product-id}/{image-name}`
- **Use Cases**: Main product images, gallery images

### Upload Process

1. Upload image to Cloudinary
2. Get the secure URL and public ID
3. Include in product data or handle separately

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorType": "BadRequestException"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "errorType": "UnauthorizedException"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden resource",
  "errorType": "ForbiddenException"
}
```

### 404 Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found",
  "errorType": "NotFoundException"
}
```

## Frontend Integration Notes

### Form Structure for Product Creation

```typescript
interface ProductFormData {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  weight: number;
  subcategoryId: string;
  options: ProductOptionFormData[];
}

interface ProductOptionFormData {
  name: string;
  type: 'SELECT' | 'TEXT' | 'NOTE' | 'CHECKBOX' | 'IMAGE';
  required: boolean;
  values: ProductOptionValueFormData[];
}

interface ProductOptionValueFormData {
  value: string;
  extraPrice: number;
}
```

### Image Upload Flow

**Note:** Option values no longer support image uploads. Images should be handled at the product level or through separate image management.

### Option Value Management

- For SELECT options: Display text-based value selections
- For TEXT options: No values array needed
- For IMAGE options: Values are text-based but represent visual selections
- For NOTE options: No values array needed
- For CHECKBOX options: Multiple selection support
- Allow drag-and-drop reordering of option values
- Support bulk operations for multiple option values

### Real-time Validation

- Validate price ranges (discountedPrice <= originalPrice)
- Ensure unique option names within a product
- Validate option types (SELECT, TEXT, NOTE, CHECKBOX, IMAGE)
- Check subcategory exists before product creation
- Validate extra price values (must be non-negative numbers)
- Ensure required options have appropriate configurations

This documentation covers all the essential endpoints and data structures needed for building a comprehensive product management interface in your admin dashboard.
