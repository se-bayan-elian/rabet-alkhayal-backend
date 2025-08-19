# Advanced Repository Pattern Implementation

This implementation provides a comprehensive, senior-level repository pattern with advanced querying capabilities, pagination, filtering, searching, and sorting.

## Features

### 🚀 Core Features

- **Generic Base Repository**: Reusable base class for all entities
- **Advanced Pagination**: Offset and cursor-based pagination
- **Dynamic Filtering**: Multiple operators (eq, ne, gt, gte, lt, lte, like, ilike, in, nin, between, isNull, isNotNull)
- **Full-Text Search**: Multi-field search with AND/OR operators
- **Flexible Sorting**: Multi-field sorting with ASC/DESC
- **Soft Delete Support**: Built-in soft delete and restore functionality
- **Relation Loading**: Configurable relation loading
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Comprehensive error handling and logging
- **Query Builder Integration**: Direct TypeORM query builder access

### 📊 Advanced Querying Examples

#### 1. Basic Pagination

```typescript
GET /api/v1/users?pagination={"page": 1, "limit": 10}
```

#### 2. Advanced Filtering

```typescript
GET /api/v1/users?filters=[
  {"field": "isActive", "operator": "eq", "value": true},
  {"field": "role", "operator": "in", "values": ["admin", "user"]},
  {"field": "createdAt", "operator": "between", "values": ["2024-01-01", "2024-12-31"]}
]
```

#### 3. Multi-Field Search

```typescript
GET /api/v1/users?search={
  "query": "john doe",
  "fields": ["firstName", "lastName", "email"],
  "operator": "OR"
}
```

#### 4. Complex Sorting

```typescript
GET /api/v1/users?sort=[
  {"field": "lastName", "direction": "ASC"},
  {"field": "firstName", "direction": "ASC"},
  {"field": "createdAt", "direction": "DESC"}
]
```

#### 5. Combined Query

```typescript
GET /api/v1/users?pagination={"page": 1, "limit": 20}&filters=[{"field": "isActive", "operator": "eq", "value": true}]&search={"query": "admin", "fields": ["role", "email"]}&sort=[{"field": "createdAt", "direction": "DESC"}]&relations=["profile"]
```

## File Structure

```
src/common/repository/
├── interfaces/
│   └── query-options.interface.ts     # Core interfaces and types
├── dto/
│   ├── query-options.dto.ts          # Request DTOs with validation
│   └── paginated-response.dto.ts     # Response DTOs
├── mappers/
│   └── query-options.mapper.ts       # DTO to interface mapping
└── base.repository.ts                # Base repository implementation

src/users/
├── repositories/
│   └── users.repository.ts           # Entity-specific repository
├── dto/
│   └── user-response.dto.ts          # User response DTO
├── users.controller.ts               # Enhanced controller with advanced endpoints
└── users.service.ts                  # Service using repository pattern
```

## Usage Guide

### 1. Creating Entity Repository

```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { YourEntity } from '../entities/your-entity.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class YourEntityRepository extends BaseRepository<YourEntity> {
  constructor(
    @InjectRepository(YourEntity)
    private readonly entityRepository: Repository<YourEntity>,
  ) {
    super(entityRepository, 'YourEntity');
  }

  // Add custom methods specific to your entity
  async findByCustomField(value: string): Promise<YourEntity[]> {
    return this.findMany({
      filters: [{ field: 'customField', operator: 'eq', value }],
    });
  }
}
```

### 2. Service Implementation

```typescript
import { Injectable } from '@nestjs/common';
import { YourEntityRepository } from './repositories/your-entity.repository';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';
import { QueryOptionsMapper } from '../common/repository/mappers/query-options.mapper';

@Injectable()
export class YourEntityService {
  constructor(private readonly repository: YourEntityRepository) {}

  async findAll(queryOptionsDto: QueryOptionsDto) {
    const queryOptions = QueryOptionsMapper.transform(queryOptionsDto);
    return this.repository.findManyWithPagination(queryOptions);
  }
}
```

### 3. Controller Implementation

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { YourEntityService } from './your-entity.service';
import { QueryOptionsDto } from '../common/repository/dto/query-options.dto';

@ApiTags('your-entity')
@Controller('your-entity')
export class YourEntityController {
  constructor(private readonly service: YourEntityService) {}

  @Get()
  @ApiOperation({ summary: 'Get entities with advanced querying' })
  findAll(@Query() queryOptions: QueryOptionsDto) {
    return this.service.findAll(queryOptions);
  }
}
```

## Filter Operators Reference

| Operator    | Description              | Example                                                                                 |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `eq`        | Equal                    | `{"field": "status", "operator": "eq", "value": "active"}`                              |
| `ne`        | Not equal                | `{"field": "status", "operator": "ne", "value": "deleted"}`                             |
| `gt`        | Greater than             | `{"field": "age", "operator": "gt", "value": 18}`                                       |
| `gte`       | Greater than or equal    | `{"field": "age", "operator": "gte", "value": 18}`                                      |
| `lt`        | Less than                | `{"field": "age", "operator": "lt", "value": 65}`                                       |
| `lte`       | Less than or equal       | `{"field": "age", "operator": "lte", "value": 65}`                                      |
| `like`      | Case-sensitive pattern   | `{"field": "name", "operator": "like", "value": "John"}`                                |
| `ilike`     | Case-insensitive pattern | `{"field": "name", "operator": "ilike", "value": "john"}`                               |
| `in`        | In array                 | `{"field": "role", "operator": "in", "values": ["admin", "user"]}`                      |
| `nin`       | Not in array             | `{"field": "status", "operator": "nin", "values": ["deleted", "banned"]}`               |
| `between`   | Between two values       | `{"field": "createdAt", "operator": "between", "values": ["2024-01-01", "2024-12-31"]}` |
| `isNull`    | Is null                  | `{"field": "deletedAt", "operator": "isNull"}`                                          |
| `isNotNull` | Is not null              | `{"field": "lastLoginAt", "operator": "isNotNull"}`                                     |

## API Endpoints

### Standard CRUD Operations

- `POST /users` - Create user
- `GET /users` - Get users with advanced querying
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user
- `PUT /users/:id/restore` - Restore soft deleted user

### Advanced Query Endpoints

- `GET /users/search?q=searchterm` - Search users
- `GET /users/active` - Get active users only
- `GET /users/role/:role` - Get users by role
- `GET /users/stats` - Get user statistics

## Benefits

### 🎯 For Senior Developers

- **Separation of Concerns**: Clear separation between data access and business logic
- **Reusability**: Base repository can be extended for any entity
- **Maintainability**: Consistent patterns across the application
- **Testability**: Easy to mock and test repositories
- **Performance**: Optimized queries with proper indexing support
- **Scalability**: Supports complex queries without N+1 problems

### 🔧 Technical Advantages

- **Type Safety**: Full TypeScript support prevents runtime errors
- **Query Optimization**: Built-in query optimization and caching support
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Integrated logging for debugging and monitoring
- **Documentation**: Auto-generated Swagger documentation
- **Validation**: Request validation with class-validator

### 📈 Business Benefits

- **Faster Development**: Reduces boilerplate code significantly
- **Consistent API**: Uniform API structure across all entities
- **Better UX**: Advanced filtering and search capabilities
- **Performance**: Efficient pagination and query optimization
- **Maintainability**: Easy to extend and modify

## Best Practices

1. **Always use pagination** for list endpoints to prevent performance issues
2. **Validate query parameters** to prevent SQL injection and invalid queries
3. **Use appropriate indexes** on frequently filtered/sorted fields
4. **Implement caching** for frequently accessed data
5. **Monitor query performance** and optimize slow queries
6. **Use soft deletes** for data integrity and audit trails
7. **Implement proper error handling** with meaningful error messages
8. **Document your APIs** with Swagger for better developer experience

## Performance Considerations

- **Indexing**: Ensure proper database indexes on filtered fields
- **Query Limits**: Implement maximum limits to prevent abuse
- **Caching**: Use Redis for frequently accessed data
- **Database Connection Pooling**: Configure proper connection pooling
- **Query Optimization**: Monitor and optimize slow queries
- **Pagination**: Always use pagination for large datasets

This implementation follows enterprise-level patterns and provides a solid foundation for scalable NestJS applications with TypeORM.
