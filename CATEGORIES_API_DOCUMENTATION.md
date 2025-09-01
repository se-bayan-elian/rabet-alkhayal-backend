# Categories API Documentation

## Overview

This document provides comprehensive API documentation for the Categories module, designed for frontend developers working on the admin dashboard. The API supports full CRUD operations for categories and subcategories with advanced features like image/icon support, statistics, and hierarchical relationships.

## Base URL

```
/api/v1/categories
```

## Authentication

All admin endpoints require JWT authentication with admin role:

```
Authorization: Bearer <admin-jwt-token>
```

## Data Structures

### Category Entity

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  iconUrl?: string;
  iconPublicId?: string;
  subcategories?: Subcategory[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Subcategory Entity

```typescript
interface Subcategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  iconUrl?: string;
  iconPublicId?: string;
  categoryId: string;
  category?: Category;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}
```

## DTOs

### CreateCategoryDto

```typescript
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category image URL',
    example: 'https://cdn.example.com/category.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Category image Cloudinary public ID',
    example: 'categories/image/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Category icon URL',
    example: 'https://cdn.example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: 'Category icon Cloudinary public ID',
    example: 'categories/icon/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconPublicId?: string;
}
```

### CreateSubcategoryDto

```typescript
export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'Subcategory name',
    example: 'Smartphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Subcategory description',
    example: 'Mobile phones and smartphones',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Subcategory image URL',
    example: 'https://cdn.example.com/subcategory.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Subcategory image Cloudinary public ID',
    example: 'subcategories/image/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @ApiProperty({
    description: 'Subcategory icon URL',
    example: 'https://cdn.example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: 'Subcategory icon Cloudinary public ID',
    example: 'subcategories/icon/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconPublicId?: string;
}
```

### UpdateCategoryDto

```typescript
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

## API Endpoints

### Categories Endpoints

#### 1. Create Category

**POST** `/api/v1/categories`

Creates a new category with optional image and icon.

**Request Body:**

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "imageUrl": "https://cdn.example.com/electronics.jpg",
  "imagePublicId": "categories/image/electronics-123",
  "iconUrl": "https://cdn.example.com/electronics-icon.png",
  "iconPublicId": "categories/icon/electronics-123"
}
```

**Response (201):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "imageUrl": "https://cdn.example.com/electronics.jpg",
  "imagePublicId": "categories/image/electronics-123",
  "iconUrl": "https://cdn.example.com/electronics-icon.png",
  "iconPublicId": "categories/icon/electronics-123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Get All Categories

**GET** `/api/v1/categories`

Retrieves categories with advanced filtering, sorting, and pagination.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort options as JSON string
- `filters`: Filter options as JSON string
- `search`: Search query
- `pagination`: Pagination options as JSON string
- `relations`: Relations to include

**Examples:**

```bash
# Basic pagination
GET /api/v1/categories?page=1&limit=20

# Search categories
GET /api/v1/categories?search=electronics

# Advanced sorting
GET /api/v1/categories?sort=[{"field":"createdAt","direction":"DESC"}]

# Advanced filtering
GET /api/v1/categories?filters=[{"field":"name","operator":"like","value":"tech"}]

# With relations
GET /api/v1/categories?relations=["subcategories"]
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "imageUrl": "https://cdn.example.com/electronics.jpg",
      "imagePublicId": "categories/image/electronics-123",
      "iconUrl": "https://cdn.example.com/electronics-icon.png",
      "iconPublicId": "categories/icon/electronics-123",
      "subcategories": [
        {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "name": "Smartphones",
          "description": "Mobile phones and smartphones"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### 3. Get Categories with Statistics

**GET** `/api/v1/categories/stats`

Retrieves categories with subcategory and product counts.

**Response (200):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "subcategoryCount": 5,
    "productCount": 150,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 4. Get Category by ID

**GET** `/api/v1/categories/:id`

Retrieves a single category with its subcategories.

**Response (200):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "imageUrl": "https://cdn.example.com/electronics.jpg",
  "imagePublicId": "categories/image/electronics-123",
  "iconUrl": "https://cdn.example.com/electronics-icon.png",
  "iconPublicId": "categories/icon/electronics-123",
  "subcategories": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Smartphones",
      "description": "Mobile phones and smartphones",
      "imageUrl": "https://cdn.example.com/smartphones.jpg",
      "imagePublicId": "subcategories/image/smartphones-123",
      "iconUrl": "https://cdn.example.com/smartphones-icon.png",
      "iconPublicId": "subcategories/icon/smartphones-123"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 5. Update Category

**PATCH** `/api/v1/categories/:id`

Updates an existing category. Supports partial updates.

**Request Body:**

```json
{
  "name": "Electronics & Gadgets",
  "description": "Electronic devices, gadgets, and accessories",
  "imageUrl": "https://cdn.example.com/electronics-new.jpg",
  "imagePublicId": "categories/image/electronics-new-123"
}
```

**Response (200):** Same as GET category response

#### 6. Delete Category

**DELETE** `/api/v1/categories/:id`

Deletes a category and all its subcategories (cascade delete).

**Response (204):** No content

### Subcategories Endpoints

#### 7. Create Subcategory

**POST** `/api/v1/categories/:categoryId/subcategories`

Creates a new subcategory for a specific category.

**Request Body:**

```json
{
  "name": "Smartphones",
  "description": "Mobile phones and smartphones",
  "imageUrl": "https://cdn.example.com/smartphones.jpg",
  "imagePublicId": "subcategories/image/smartphones-123",
  "iconUrl": "https://cdn.example.com/smartphones-icon.png",
  "iconPublicId": "subcategories/icon/smartphones-123"
}
```

**Response (201):**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "Smartphones",
  "description": "Mobile phones and smartphones",
  "imageUrl": "https://cdn.example.com/smartphones.jpg",
  "imagePublicId": "subcategories/image/smartphones-123",
  "iconUrl": "https://cdn.example.com/smartphones-icon.png",
  "iconPublicId": "subcategories/icon/smartphones-123",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 8. Get Subcategories for Category

**GET** `/api/v1/categories/:categoryId/subcategories`

Retrieves all subcategories for a specific category.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort options as JSON string
- `filters`: Filter options as JSON string
- `search`: Search query

**Response (200):**

```json
{
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Smartphones",
      "description": "Mobile phones and smartphones",
      "imageUrl": "https://cdn.example.com/smartphones.jpg",
      "imagePublicId": "subcategories/image/smartphones-123",
      "iconUrl": "https://cdn.example.com/smartphones-icon.png",
      "iconPublicId": "subcategories/icon/smartphones-123",
      "categoryId": "123e4567-e89b-12d3-a456-426614174000",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 9. Get Subcategories with Statistics

**GET** `/api/v1/categories/subcategories/stats`

Retrieves subcategories with product counts.

**Query Parameters:**

- `categoryId`: Filter by category ID (optional)

**Response (200):**

```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Smartphones",
    "description": "Mobile phones and smartphones",
    "categoryId": "123e4567-e89b-12d3-a456-426614174000",
    "categoryName": "Electronics",
    "productCount": 25,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 10. Update Subcategory

**PATCH** `/api/v1/categories/subcategories/:subcategoryId`

Updates an existing subcategory.

**Request Body:**

```json
{
  "name": "Mobile Phones",
  "description": "Smartphones and mobile phones",
  "imageUrl": "https://cdn.example.com/mobile-phones.jpg",
  "imagePublicId": "subcategories/image/mobile-phones-123"
}
```

**Response (200):** Same as GET subcategory response

#### 11. Delete Subcategory

**DELETE** `/api/v1/categories/subcategories/:subcategoryId`

Deletes a subcategory.

**Response (204):** No content

## Image Upload Guidelines

### Category Images

- **Format**: PNG, JPEG, JPG
- **Max Size**: 5MB
- **Recommended Dimensions**: 800x600px for category images, 100x100px for icons
- **Naming Convention**: `categories/{type}/{category-slug}-{timestamp}`
- **Types**: `image` for main images, `icon` for icons

### Subcategory Images

- **Format**: PNG, JPEG, JPG
- **Max Size**: 5MB
- **Recommended Dimensions**: 600x400px for subcategory images, 80x80px for icons
- **Naming Convention**: `subcategories/{type}/{subcategory-slug}-{timestamp}`
- **Types**: `image` for main images, `icon` for icons

### Upload Process

1. Upload image to Cloudinary
2. Get the secure URL and public ID
3. Include both in the category/subcategory data
4. For updates, remember to delete old images from Cloudinary if replacing

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
  "message": "Category not found",
  "errorType": "NotFoundException"
}
```

## Frontend Integration Notes

### Form Structure for Category Creation

```typescript
interface CategoryFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  iconUrl?: string;
  iconPublicId?: string;
}

interface SubcategoryFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  iconUrl?: string;
  iconPublicId?: string;
}
```

### Image Upload Flow

1. User selects image file
2. Upload to Cloudinary via your upload endpoint
3. Receive URL and public ID
4. Include in form data
5. Submit category/subcategory creation/update

### Hierarchical Data Management

- Categories contain subcategories
- Subcategories belong to one category
- When deleting a category, all subcategories are deleted (cascade)
- Products belong to subcategories

### Statistics Integration

- Use `/stats` endpoints for dashboard overview
- Display subcategory and product counts
- Useful for admin dashboard widgets

### Search and Filtering

- Implement client-side search for better UX
- Use server-side filtering for large datasets
- Support both category and subcategory search

This documentation covers all the essential endpoints and data structures needed for building a comprehensive category management interface in your admin dashboard.
