# API Examples for Services (Updated August 2025)

## Get All Services

`GET /api/services`

Response:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Web Development",
      "description": "Complete web development solutions including frontend and backend",
      "icon": "https://res.cloudinary.com/demo/image/upload/v1234/icons/web-dev.png",
      "iconPublicId": "icons/web-dev",
      "image": "https://res.cloudinary.com/demo/image/upload/v1234/images/web-development.jpg",
      "imagePublicId": "images/web-development",
      "projects": [],
      "createdAt": "2025-08-24T09:25:31.833Z",
      "updatedAt": "2025-08-24T09:25:31.833Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## Create Service with Projects

`POST /api/services`
Content-Type: multipart/form-data

Service Data Fields:

```
name: Web Development
description: Full-stack web development services
isActive: true
icon: <file> # Service icon file
image: <file> # Service main image file

# Projects Array (Each project is a field with array index)
projects[0][title]: E-commerce Website
projects[0][description]: Modern e-commerce platform
projects[0][mainImage]: <file> # Project main image file
projects[0][gallery][0]: <file> # Gallery image 1
projects[0][gallery][1]: <file> # Gallery image 2

projects[1][title]: Portfolio Website
projects[1][description]: Professional portfolio
projects[1][mainImage]: <file> # Project main image file
projects[1][gallery][0]: <file> # Gallery image 1
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Web Development",
  "description": "Full-stack web development services",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1234/services/icons/abc123.png",
  "iconPublicId": "services/icons/abc123",
  "image": "https://res.cloudinary.com/demo/image/upload/v1234/services/images/def456.jpg",
  "imagePublicId": "services/images/def456",
  "isActive": true,
  "createdAt": "2025-08-21T10:00:00.000Z",
  "updatedAt": "2025-08-21T10:00:00.000Z",
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "E-commerce Website",
      "description": "Modern e-commerce platform",
      "mainImageUrl": "https://res.cloudinary.com/demo/image/upload/v1234/projects/main/ghi789.jpg",
      "mainImagePublicId": "projects/main/ghi789",
      "galleryUrls": [
        "https://res.cloudinary.com/demo/image/upload/v1234/projects/gallery/jkl012.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1234/projects/gallery/mno345.jpg"
      ],
      "galleryPublicIds": ["projects/gallery/jkl012", "projects/gallery/mno345"]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Portfolio Website",
      "description": "Professional portfolio",
      "mainImageUrl": "https://res.cloudinary.com/demo/image/upload/v1234/projects/main/pqr678.jpg",
      "mainImagePublicId": "projects/main/pqr678",
      "galleryUrls": [
        "https://res.cloudinary.com/demo/image/upload/v1234/projects/gallery/stu901.jpg"
      ],
      "galleryPublicIds": ["projects/gallery/stu901"]
    }
  ]
}
```

## Update Service with Files

### Full Update (Including Projects)

```http
PATCH /api/services/{serviceId}
Content-Type: multipart/form-data

# Basic info update
name: Updated Service Name
description: Updated service description
isActive: true

# File updates
icon: <file> # New icon file (PNG, JPEG, JPG only)
image: <file> # New main image file (PNG, JPEG, JPG only)

# Project updates (existing projects will be replaced)
projects[0][title]: Updated Project
projects[0][description]: Updated description
projects[0][mainImage]: <file> # New main image
projects[0][gallery][0]: <file> # New gallery image 1
projects[0][gallery][1]: <file> # New gallery image 2
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Service Name",
  "description": "Updated service description",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1234/services/icons/xyz789.png",
  "iconPublicId": "services/icons/xyz789",
  "image": "https://res.cloudinary.com/demo/image/upload/v1234/services/images/abc123.jpg",
  "imagePublicId": "services/images/abc123",
  "isActive": true,
  "updatedAt": "2025-08-26T10:30:00.000Z",
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Updated Project",
      "description": "Updated description",
      "mainImageUrl": "https://res.cloudinary.com/demo/image/upload/v1234/projects/main/def456.jpg",
      "mainImagePublicId": "projects/main/def456",
      "galleryUrls": [
        "https://res.cloudinary.com/demo/image/upload/v1234/projects/gallery/ghi789.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1234/projects/gallery/jkl012.jpg"
      ],
      "galleryPublicIds": ["projects/gallery/ghi789", "projects/gallery/jkl012"]
    }
  ]
}
```

### Partial Update (Files Only)

```http
PATCH /api/services/{serviceId}
Content-Type: multipart/form-data

# Only updating files
icon: <file> # New icon file
image: <file> # New main image file
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1234/services/icons/new789.png",
  "iconPublicId": "services/icons/new789",
  "image": "https://res.cloudinary.com/demo/image/upload/v1234/services/images/new123.jpg",
  "imagePublicId": "services/images/new123",
  "updatedAt": "2025-08-26T10:35:00.000Z"
}
```

### Important Notes for Updates

1. File Updates:
   - Old files are automatically deleted from Cloudinary
   - New public IDs and URLs are generated
   - You can update either icon, image, or both
   - Maximum file size: 5MB per file
   - Supported formats: PNG, JPEG, JPG

2. Project Updates:
   - When updating projects, all existing projects will be replaced
   - Old project images are automatically deleted from Cloudinary
   - New project images are uploaded and stored
   - Project order is preserved as sent in the request

3. Partial Updates:
   - You can update only the files without changing other fields
   - You can update only the basic info without changing files
   - Omitted fields will keep their current values

### Upload Service Icon

```http
POST /api/services/{serviceId}/icon
Content-Type: multipart/form-data

file: <file> # Icon image file (PNG, JPEG, JPG only)
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1234/services/icons/new123.png",
  "iconPublicId": "services/icons/new123"
}
```

### Upload Service Image

```http
POST /api/services/{serviceId}/image
Content-Type: multipart/form-data

file: <file> # Main image file (PNG, JPEG, JPG only)
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "image": "https://res.cloudinary.com/demo/image/upload/v1234/services/images/new456.jpg",
  "imagePublicId": "services/images/new456"
}
```

### Project Image Management

#### Upload Project Main Image

```http
POST /api/projects/{projectId}/image
Content-Type: multipart/form-data

file: <file> # Project main image file
```

#### Upload Project Gallery Image

```http
POST /api/projects/{projectId}/gallery
Content-Type: multipart/form-data

file: <file> # Gallery image file
```

#### Remove Project Gallery Image

```http
DELETE /api/projects/{projectId}/gallery/{imageIndex}
```

### Error Responses

#### Invalid File Type

```json
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: jpg, jpeg, png",
  "error": "Bad Request"
}
```

#### File Too Large

```json
{
  "statusCode": 400,
  "message": "File size exceeds maximum limit of 5MB",
  "error": "Bad Request"
}
```

### Important Notes

1. All images are now processed through Cloudinary
2. Supported image formats: JPG, JPEG, PNG
3. Maximum file size: 5MB per image
4. Image public IDs are stored for proper cleanup
5. File uploads must use multipart/form-data
6. Translations have been removed; all text fields are now simple strings

You can request Arabic translation using either:

```http
GET /api/services?page=1&limit=10&lang=ar
```

or

```http
GET /api/services?page=1&limit=10
Accept-Language: ar
```

Response will be:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "تطوير المواقع",
      "description": "خدمات تطوير مواقع احترافية للشركات الحديثة",
      "icon": "https://example.com/icon.png",
      "image": "https://example.com/image.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Projects API Documentation

#### Create Project

```http
POST /api/services/projects
```

Request Body:

```json
{
  "serviceId": "123e4567-e89b-12d3-a456-426614174000",
  "title": {
    "en": "E-commerce Platform",
    "ar": "منصة التجارة الإلكترونية"
  },
  "description": {
    "en": "Full-featured online store",
    "ar": "متجر إلكتروني متكامل"
  },
  "mainImageUrl": "https://example.com/project.jpg"
}
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "serviceId": "123e4567-e89b-12d3-a456-426614174000",
  "title": {
    "en": "E-commerce Platform",
    "ar": "منصة التجارة الإلكترونية"
  },
  "description": {
    "en": "Full-featured online store",
    "ar": "متجر إلكتروني متكامل"
  },
  "mainImageUrl": "https://example.com/project.jpg",
  "imagePublicId": "projects/images/abc123",
  "gallery": [],
  "galleryPublicIds": []
}
```

#### Upload Project Image

```http
POST /api/services/projects/:id/image
Content-Type: multipart/form-data
```

Request Body:

```
file: [binary data]
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "mainImageUrl": "https://example.com/uploaded-project.jpg",
  "imagePublicId": "projects/images/new789"
}
```

#### Upload Project Gallery Image

```http
POST /api/services/projects/:id/gallery
Content-Type: multipart/form-data
```

Request Body:

```
file: [binary data]
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "gallery": [
    "https://example.com/gallery1.jpg",
    "https://example.com/gallery2.jpg"
  ],
  "galleryPublicIds": ["projects/gallery/gal123", "projects/gallery/gal456"]
}
```

### Notes

1. All endpoints that modify data (POST, PUT, DELETE) require authentication.
2. File uploads should be sent as `multipart/form-data`.
3. All image files are stored in Cloudinary and their public IDs are saved in the database.
4. Language Selection:
   - Use the `Accept-Language` header (e.g., `Accept-Language: ar`) for language preference
   - Alternatively, use the `lang` query parameter (e.g., `?lang=ar`)
   - If neither is specified, English (en) will be used as the default
   - Use `allTranslations=true` query parameter to get both languages in the response
5. Dates are returned in ISO 8601 format.
6. Translation Fields:
   - When creating/updating resources, send translations as objects: `{ "en": "text", "ar": "text" }`
   - By default, responses will show only the selected language's content
   - Use `allTranslations=true` to get the full translation object for all fields

### Language Examples

#### Using Accept-Language Header

Request:

```http
GET /api/services
Accept-Language: ar
```

Response:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "تطوير المواقع",
      "description": "خدمات تطوير مواقع احترافية للشركات الحديثة",
      "icon": "https://example.com/icon.png",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

#### Using Query Parameter

Request:

```http
GET /api/services?lang=en
```

Response:

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Web Development",
      "description": "Professional web development services for modern businesses",
      "icon": "https://example.com/icon.png",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

---

# Products API - Unified GET Endpoint Examples

The Products API has been refactored to use a single, unified GET endpoint that supports all filtering, searching, pagination, and sorting operations.

## Base URL

`GET /products`

## Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Search

- `search`: Search query to find products by name, description, etc.

### Price Filtering

- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

### Category Filtering

- `subcategoryId`: Filter by subcategory ID (UUID format)

### Advanced Filtering

- `filters`: JSON array of filter objects
- `sort`: JSON array of sort objects

## Example Requests

### 1. Basic pagination

```
GET /products?page=1&limit=20
```

### 2. Search products

```
GET /products?search=iPhone&page=1&limit=10
```

### 3. Filter by price range

```
GET /products?minPrice=100&maxPrice=1000
```

### 4. Filter by subcategory

```

```

## Get Single Service

`GET /services/:id`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": {
    "en": "Web Development",
    "ar": "تطوير المواقع"
  },
  "description": {
    "en": "Complete web development solutions including frontend and backend",
    "ar": "خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية"
  },
  "icon": "https://example.com/icons/web-dev.png",
  "image": "https://example.com/images/web-development.jpg",
  "projects": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": {
        "en": "E-commerce Platform",
        "ar": "منصة التجارة الإلكترونية"
      },
      "description": {
        "en": "Modern e-commerce solution with advanced features",
        "ar": "حل حديث للتجارة الإلكترونية مع ميزات متقدمة"
      },
      "gallery": [
        "https://example.com/gallery/ecommerce1.jpg",
        "https://example.com/gallery/ecommerce2.jpg"
      ]
    }
  ],
  "features": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": {
        "en": "Responsive Design",
        "ar": "تصميم متجاوب"
      },
      "description": {
        "en": "Works perfectly on all devices and screen sizes",
        "ar": "يعمل بشكل مثالي على جميع الأجهزة وأحجام الشاشات"
      }
    }
  ],
  "pricingPlans": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": {
        "en": "Basic Plan",
        "ar": "الخطة الأساسية"
      },
      "description": {
        "en": "Perfect for small businesses and startups",
        "ar": "مثالي للشركات الصغيرة والشركات الناشئة"
      },
      "price": 99.99,
      "features": [
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "name": {
            "en": "5 Pages",
            "ar": "5 صفحات"
          }
        }
      ]
    }
  ],
  "createdAt": "2025-08-24T09:25:31.833Z",
  "updatedAt": "2025-08-24T09:25:31.833Z"
}
```

## Create Service

`POST /services`

Request Body:

```json
{
  "name": {
    "en": "Web Development",
    "ar": "تطوير المواقع"
  },
  "description": {
    "en": "Complete web development solutions including frontend and backend",
    "ar": "خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية"
  },
  "icon": "https://example.com/icons/web-dev.png",
  "image": "https://example.com/images/web-development.jpg"
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": {
    "en": "Web Development",
    "ar": "تطوير المواقع"
  },
  "description": {
    "en": "Complete web development solutions including frontend and backend",
    "ar": "خدمات تطوير المواقع المتكاملة شاملة الواجهة الأمامية والخلفية"
  },
  "icon": "https://example.com/icons/web-dev.png",
  "image": "https://example.com/images/web-development.jpg",
  "projects": [],
  "features": [],
  "pricingPlans": [],
  "createdAt": "2025-08-24T09:25:31.833Z",
  "updatedAt": "2025-08-24T09:25:31.833Z"
}
```

## Update Service

`PUT /services/:id`

Request Body:

```json
{
  "name": {
    "en": "Updated Web Development",
    "ar": "تطوير المواقع المحدث"
  },
  "description": {
    "en": "Updated web development solutions including frontend and backend",
    "ar": "خدمات تطوير المواقع المتكاملة المحدثة شاملة الواجهة الأمامية والخلفية"
  },
  "icon": "https://example.com/icons/web-dev-updated.png",
  "image": "https://example.com/images/web-development-updated.jpg"
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": {
    "en": "Updated Web Development",
    "ar": "تطوير المواقع المحدث"
  },
  "description": {
    "en": "Updated web development solutions including frontend and backend",
    "ar": "خدمات تطوير المواقع المتكاملة المحدثة شاملة الواجهة الأمامية والخلفية"
  },
  "icon": "https://example.com/icons/web-dev-updated.png",
  "image": "https://example.com/images/web-development-updated.jpg",
  "projects": [],
  "features": [],
  "pricingPlans": [],
  "createdAt": "2025-08-24T09:25:31.833Z",
  "updatedAt": "2025-08-24T09:25:31.833Z"
}
```

## Delete Service

`DELETE /services/:id`

Response:

```json
{
  "message": "Service deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Responses

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Service not found",
  "error": "Not Found"
}
```

### Unauthorized (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden (403)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Bad Request (400)

```json
{
  "statusCode": 400,
  "message": ["name must be a valid JSON object"],
  "error": "Bad Request"
}
```

```

### 5. Combined search with price filter

```

GET /products?search=phone&minPrice=500&maxPrice=1500&page=1&limit=10

```

### 6. Advanced filtering with JSON

```

GET /products?filters=[{"field":"name","operator":"like","value":"iPhone"}]&sort=[{"field":"originalPrice","direction":"ASC"}]

```

### 7. Complex combined query

```

GET /products?search=laptop&minPrice=800&maxPrice=2000&subcategoryId=123e4567-e89b-12d3-a456-426614174000&sort=[{"field":"createdAt","direction":"DESC"}]&page=1&limit=15

```

## Previous Separate Endpoints (Now Deprecated)

The following endpoints have been consolidated into the unified GET endpoint:

- ~~`GET /products/search?q=query`~~ → Use `GET /products?search=query`
- ~~`GET /products/price-range?minPrice=100&maxPrice=1000`~~ → Use `GET /products?minPrice=100&maxPrice=1000`

## Benefits of the Refactored API

1. **REST Compliance**: Single resource endpoint with query parameters
2. **Flexibility**: Combine multiple filters, search, and sorting in one request
3. **Performance**: Reduced number of API calls
4. **Consistency**: Uniform parameter structure across all operations
5. **Extensibility**: Easy to add new filters without creating new endpoints

## Subcategory-Specific Endpoint

For convenience, the subcategory-specific endpoint is still available:

```

GET /products/subcategory/{subcategoryId}

````

This endpoint supports all the same query parameters as the main endpoint.

---

## Products API - Create/Update with Questions System

**📋 Complete documentation available in: [PRODUCTS_API_EXAMPLES.md](PRODUCTS_API_EXAMPLES.md)**

The Products API now uses a **questions-based system** where admins can create customizable product questions with various answer types:

- **SELECT**: Multiple choice with predefined answers
- **TEXT**: Free text input from customers
- **IMAGE**: Customer image uploads
- **CHECKBOX**: Multiple selection options
- **NOTE**: Multi-line text input

### Key Features

- Product-level images with Cloudinary integration
- Featured product support
- Flexible question customization
- Cart integration with customer selections
- Comprehensive validation and error handling

### Quick Example

```json
{
  "name": "Custom T-Shirt",
  "originalPrice": 29.99,
  "discountedPrice": 24.99,
  "imageUrl": "https://cdn.example.com/tshirt.jpg",
  "imagePublicId": "products/tshirt-123",
  "isFeatured": false,
  "questions": [
    {
      "questionText": "What size would you like?",
      "type": "SELECT",
      "required": true,
      "answers": [
        {"answerText": "Small", "extraPrice": 0},
        {"answerText": "Large", "extraPrice": 2.00}
      ]
    },
    {
      "questionText": "Add a custom message",
      "type": "TEXT",
      "required": false,
      "answers": []
    }
  ]
}
````

For detailed examples, request/response formats, and error handling, see **[PRODUCTS_API_EXAMPLES.md](PRODUCTS_API_EXAMPLES.md)**.

```

```
