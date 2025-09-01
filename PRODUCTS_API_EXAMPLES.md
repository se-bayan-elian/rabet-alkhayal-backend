# Products API - Create/Update Examples (Updated August 2025)

## Create Product with Questions

`POST /products`

Request Body:

```json
{
  "name": "Custom T-Shirt",
  "originalPrice": 29.99,
  "discountedPrice": 24.99,
  "weight": 0.3,
  "subcategoryId": "123e4567-e89b-12d3-a456-426614174000",
  "imageUrl": "https://cdn.example.com/tshirt.jpg",
  "imagePublicId": "products/tshirt-123",
  "isFeatured": false,
  "questions": [
    {
      "questionText": "What size would you like?",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "answerText": "Small",
          "extraPrice": 0
        },
        {
          "answerText": "Medium",
          "extraPrice": 0
        },
        {
          "answerText": "Large",
          "extraPrice": 2.0
        },
        {
          "answerText": "XL",
          "extraPrice": 4.0
        }
      ]
    },
    {
      "questionText": "Choose your color",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "answerText": "White",
          "extraPrice": 0
        },
        {
          "answerText": "Black",
          "extraPrice": 0
        },
        {
          "answerText": "Navy Blue",
          "extraPrice": 1.5
        }
      ]
    },
    {
      "questionText": "Add a custom message",
      "type": "TEXT",
      "required": false,
      "answers": []
    },
    {
      "questionText": "Upload your logo",
      "type": "IMAGE",
      "required": false,
      "answers": []
    }
  ]
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Custom T-Shirt",
  "originalPrice": 29.99,
  "discountedPrice": 24.99,
  "weight": 0.3,
  "subcategoryId": "123e4567-e89b-12d3-a456-426614174000",
  "imageUrl": "https://cdn.example.com/tshirt.jpg",
  "imagePublicId": "products/tshirt-123",
  "isFeatured": false,
  "createdAt": "2025-08-30T10:00:00.000Z",
  "updatedAt": "2025-08-30T10:00:00.000Z",
  "subcategory": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "T-Shirts",
    "description": "Comfortable cotton t-shirts"
  },
  "questions": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "questionText": "What size would you like?",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "answerText": "Small",
          "extraPrice": 0
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440003",
          "answerText": "Medium",
          "extraPrice": 0
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440004",
          "answerText": "Large",
          "extraPrice": 2.0
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440005",
          "answerText": "XL",
          "extraPrice": 4.0
        }
      ]
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440006",
      "questionText": "Choose your color",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "id": "770e8400-e29b-41d4-a716-446655440007",
          "answerText": "White",
          "extraPrice": 0
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440008",
          "answerText": "Black",
          "extraPrice": 0
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440009",
          "answerText": "Navy Blue",
          "extraPrice": 1.5
        }
      ]
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440010",
      "questionText": "Add a custom message",
      "type": "TEXT",
      "required": false,
      "answers": []
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440011",
      "questionText": "Upload your logo",
      "type": "IMAGE",
      "required": false,
      "answers": []
    }
  ]
}
```

## Update Product with Questions

`PUT /products/:id`

Request Body:

```json
{
  "name": "Premium Custom T-Shirt",
  "originalPrice": 39.99,
  "discountedPrice": 34.99,
  "questions": [
    {
      "questionText": "What size would you like?",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "answerText": "Small",
          "extraPrice": 0
        },
        {
          "answerText": "Medium",
          "extraPrice": 0
        },
        {
          "answerText": "Large",
          "extraPrice": 3.0
        },
        {
          "answerText": "XL",
          "extraPrice": 5.0
        },
        {
          "answerText": "XXL",
          "extraPrice": 7.0
        }
      ]
    },
    {
      "questionText": "Choose your print style",
      "type": "SELECT",
      "required": true,
      "answers": [
        {
          "answerText": "Screen Print",
          "extraPrice": 0
        },
        {
          "answerText": "DTG Print",
          "extraPrice": 5.0
        },
        {
          "answerText": "Heat Transfer",
          "extraPrice": 3.0
        }
      ]
    },
    {
      "questionText": "Special instructions",
      "type": "TEXT",
      "required": false,
      "answers": []
    }
  ]
}
```

## Question Types Supported

### 1. SELECT (Multiple Choice)

- Predefined answers with optional extra pricing
- Customer selects one option

### 2. TEXT (Free Text Input)

- Customer enters custom text
- No predefined answers needed
- Useful for names, messages, special instructions

### 3. IMAGE (Image Upload)

- Customer uploads their own image
- No predefined answers needed
- Useful for logos, custom designs

### 4. CHECKBOX (Multiple Selection)

- Customer can select multiple options
- Each selection can have extra pricing

### 5. NOTE (Text Area)

- Multi-line text input
- Similar to TEXT but for longer content

## Cart Customization Examples

When adding products with questions to cart:

`POST /cart/items`

Request Body:

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 2,
  "unitPrice": 34.99,
  "customizations": [
    {
      "optionId": "660e8400-e29b-41d4-a716-446655440001",
      "questionText": "What size would you like?",
      "selectedAnswer": "Large",
      "additionalPrice": 3.0
    },
    {
      "optionId": "660e8400-e29b-41d4-a716-446655440006",
      "questionText": "Choose your print style",
      "selectedAnswer": "DTG Print",
      "additionalPrice": 5.0
    },
    {
      "optionId": "660e8400-e29b-41d4-a716-446655440010",
      "questionText": "Special instructions",
      "customerInput": "Please make sure the print is centered",
      "additionalPrice": 0
    }
  ]
}
```

## Error Responses

### Bad Request (400)

```json
{
  "statusCode": 400,
  "message": [
    "questions.0.questionText must be a string",
    "questions.0.answers.0.answerText is required"
  ],
  "error": "Bad Request"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

### Validation Error for Question Types

```json
{
  "statusCode": 400,
  "message": [
    "TEXT and IMAGE type questions should not have predefined answers",
    "SELECT type questions must have at least one answer"
  ],
  "error": "Bad Request"
}
```
