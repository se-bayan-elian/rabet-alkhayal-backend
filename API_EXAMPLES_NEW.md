# API Examples for Services (Updated - No Translations)

## Get All Services

`GET /api/services`

Response:

````json
{
  "data": [
    {
      "id": ## Breaking Changes from Previous Version

1. Translation objects removed:
   - Previously: `{ "en": "Text", "ar": "Ø§Ù„Ù†Øµ" }`
   - Now: `"Text"` (direct string)
2. No need to send language headers
3. No locale query parameters needed
4. Same API endpoints, simpler request/response format

---

## Products API - Questions-Based System

**📋 Complete documentation available in: [PRODUCTS_API_EXAMPLES.md](../PRODUCTS_API_EXAMPLES.md)**

The Products API has been refactored to use a **questions-based system** instead of the old options-based system. This provides more flexibility for product customization.

### Key Changes from Options to Questions

- **Old System**: Products had "options" with "values"
- **New System**: Products have "questions" with "answers"

### Supported Question Types

1. **SELECT**: Multiple choice questions with predefined answers
2. **TEXT**: Free text input from customers
3. **IMAGE**: Customer image uploads
4. **CHECKBOX**: Multiple selection options
5. **NOTE**: Multi-line text input

### Quick Create Example

```json
POST /products
{
  "name": "Custom T-Shirt",
  "originalPrice": 29.99,
  "discountedPrice": 24.99,
  "imageUrl": "https://cdn.example.com/tshirt.jpg",
  "imagePublicId": "products/tshirt-123",
  "isFeatured": false,
  "questions": [
    {
      "questionText": "What size?",
      "type": "SELECT",
      "required": true,
      "answers": [
        {"answerText": "Small", "extraPrice": 0},
        {"answerText": "Large", "extraPrice": 2.00}
      ]
    }
  ]
}
````

For comprehensive examples including all question types, cart integration, and error handling, see **[PRODUCTS_API_EXAMPLES.md](../PRODUCTS_API_EXAMPLES.md)**.0-e29b-41d4-a716-446655440000",
"name": "Web Development",
"description": "Complete web development solutions including frontend and backend",
"icon": "https://example.com/icons/web-dev.png",
"image": "https://example.com/images/web-development.jpg",
"projects": [],
"features": [],
"pricingPlans": [],
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

````

## Create Service

`POST /api/services`
Content-Type: application/json

```json
{
  "name": "Web Development",
  "description": "Complete web development solutions including frontend and backend",
  "icon": "https://example.com/icons/web-dev.png",
  "image": "https://example.com/images/web-development.jpg",
  "isActive": true,
  "displayOrder": 1
}
````

## Create Project

`POST /api/services/{serviceId}/projects`
Content-Type: application/json

```json
{
  "serviceId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "E-commerce Website",
  "description": "Modern e-commerce platform with advanced features",
  "mainImageUrl": "https://example.com/projects/ecommerce.jpg",
  "gallery": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "projectUrl": "https://demo.ecommerce-project.com",
  "githubUrl": "https://github.com/company/ecommerce-project",
  "clientName": "ABC Company",
  "completionDate": "2025-08-01",
  "isFeatured": true,
  "isVisible": true,
  "displayOrder": 1
}
```

## Create Pricing Plan with Features

`POST /api/services/{serviceId}/pricing-plans`
Content-Type: application/json

```json
{
  "serviceId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Basic Plan",
  "description": "Perfect for small businesses getting started",
  "originalPrice": 399.99,
  "finalPrice": 299.99,
  "revisions": 2,
  "isActive": true,
  "displayOrder": 1,
  "billingPeriod": "one-time",
  "deliveryDays": 14,
  "isPopular": false,
  "features": [
    {
      "name": "Logo Design",
      "description": "Professional logo design with unlimited revisions",
      "icon": "✓",
      "isIncluded": true,
      "quantity": "1",
      "displayOrder": 1
    },
    {
      "name": "Website Pages",
      "description": "Custom designed web pages",
      "icon": "✓",
      "isIncluded": true,
      "quantity": "5",
      "displayOrder": 2
    }
  ]
}
```

## Update Service

`PATCH /api/services/{serviceId}`
Content-Type: application/json

```json
{
  "name": "Updated Web Development",
  "description": "Updated description",
  "isActive": false
}
```

## Update Project

`PATCH /api/services/{serviceId}/projects/{projectId}`
Content-Type: application/json

```json
{
  "title": "Updated E-commerce Website",
  "description": "Updated description",
  "isVisible": false
}
```

## Update Pricing Plan

`PATCH /api/services/{serviceId}/pricing-plans/{planId}`
Content-Type: application/json

```json
{
  "name": "Updated Basic Plan",
  "description": "Updated description",
  "originalPrice": 499.99,
  "finalPrice": 399.99
}
```

## Important Notes

1. All text fields (name, title, description) no longer use translations - just provide the text directly
2. Fields marked with `@IsOptional()` in the DTOs can be omitted from the requests
3. IDs are UUIDs and will be generated by the server
4. All date fields should be in ISO format (YYYY-MM-DD)
5. All URLs should be valid and accessible
6. Image URLs should point to already uploaded images
7. The order of items can be controlled using the `displayOrder` field (lower numbers appear first)
8. Boolean fields default to `false` if not provided

## Breaking Changes from Previous Version

1. Translation objects removed:
   - Previously: `{ "en": "Text", "ar": "النص" }`
   - Now: `"Text"` (direct string)
2. No need to send language headers
3. No locale query parameters needed
4. Same API endpoints, simpler request/response format
