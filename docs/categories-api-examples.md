// API examples for categories and subcategories

// Create Category
// POST /api/v1/categories
{
"name": "Electronics",
"description": "All electronic items",
"imageUrl": "https://cdn.example.com/category-image.jpg",
"imagePublicId": "cat-img-uuid",
"iconUrl": "https://cdn.example.com/category-icon.png",
"iconPublicId": "cat-icon-uuid"
}

// Response
{
"id": "category-uuid",
"name": "Electronics",
"description": "All electronic items",
"imageUrl": "https://cdn.example.com/category-image.jpg",
"imagePublicId": "cat-img-uuid",
"iconUrl": "https://cdn.example.com/category-icon.png",
"iconPublicId": "cat-icon-uuid",
"createdAt": "2025-08-28T10:00:00.000Z"
}

// Create Subcategory
// POST /api/v1/categories/:categoryId/subcategories
{
"name": "Mobile Phones",
"description": "Smartphones and accessories",
"imageUrl": "https://cdn.example.com/subcategory-image.jpg",
"imagePublicId": "subcat-img-uuid",
"iconUrl": "https://cdn.example.com/subcategory-icon.png",
"iconPublicId": "subcat-icon-uuid"
}

// Response
{
"id": "subcategory-uuid",
"categoryId": "category-uuid",
"name": "Mobile Phones",
"description": "Smartphones and accessories",
"imageUrl": "https://cdn.example.com/subcategory-image.jpg",
"imagePublicId": "subcat-img-uuid",
"iconUrl": "https://cdn.example.com/subcategory-icon.png",
"iconPublicId": "subcat-icon-uuid",
"createdAt": "2025-08-28T10:05:00.000Z"
}

// Get All Categories
// GET /api/v1/categories
[
{
"id": "category-uuid",
"name": "Electronics",
"description": "All electronic items",
"imageUrl": "https://cdn.example.com/category-image.jpg",
"imagePublicId": "cat-img-uuid",
"iconUrl": "https://cdn.example.com/category-icon.png",
"iconPublicId": "cat-icon-uuid",
"createdAt": "2025-08-28T10:00:00.000Z",
"subcategories": [
{
"id": "subcategory-uuid",
"name": "Mobile Phones",
"description": "Smartphones and accessories",
"imageUrl": "https://cdn.example.com/subcategory-image.jpg",
"imagePublicId": "subcat-img-uuid",
"iconUrl": "https://cdn.example.com/subcategory-icon.png",
"iconPublicId": "subcat-icon-uuid",
"createdAt": "2025-08-28T10:05:00.000Z"
}
]
}
]

// Get Subcategories for a Category
// GET /api/v1/categories/:categoryId/subcategories
[
{
"id": "subcategory-uuid",
"name": "Mobile Phones",
"description": "Smartphones and accessories",
"imageUrl": "https://cdn.example.com/subcategory-image.jpg",
"imagePublicId": "subcat-img-uuid",
"iconUrl": "https://cdn.example.com/subcategory-icon.png",
"iconPublicId": "subcat-icon-uuid",
"createdAt": "2025-08-28T10:05:00.000Z"
}
]
