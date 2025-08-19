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
GET /products?subcategoryId=123e4567-e89b-12d3-a456-426614174000
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
```

This endpoint supports all the same query parameters as the main endpoint.
