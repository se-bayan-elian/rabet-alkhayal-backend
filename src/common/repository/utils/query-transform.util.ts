import { QueryOptionsDto, SearchDto } from '../dto/query-options.dto';

/**
 * Transform flat query parameters to nested QueryOptionsDto structure
 */
export function transformQueryParams(query: any): QueryOptionsDto {
  console.log('Input query parameters:', JSON.stringify(query, null, 2));

  const result: QueryOptionsDto = {};

  // Handle pagination
  if (query.page !== undefined || query.limit !== undefined) {
    result.pagination = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
    };
  }

  // Handle sort - can be a JSON string or direct object
  if (query.sort) {
    try {
      const sortData =
        typeof query.sort === 'string' ? JSON.parse(query.sort) : query.sort;
      result.sort = Array.isArray(sortData) ? sortData : [sortData];
      console.log('Parsed sort data:', result.sort);
    } catch (error) {
      // If parsing fails, ignore sort
      console.warn('Failed to parse sort parameter:', error);
    }
  }

  // Handle filters - can be a JSON string or direct object
  if (query.filters) {
    try {
      const filterData =
        typeof query.filters === 'string'
          ? JSON.parse(query.filters)
          : query.filters;
      result.filters = Array.isArray(filterData) ? filterData : [filterData];
    } catch (error) {
      // If parsing fails, ignore filters
      console.warn('Failed to parse filters parameter:', error);
    }
  }

  // Handle search - support both old format (query.query) and new format (query.search)
  if (query.search || query.query || query.fields || query.operator) {
    result.search = {
      query: '',
      fields: ['name', 'description'], // Default search fields for products
    } as SearchDto;

    // Support both 'search' and 'query' parameters for search text
    const searchText = query.search || query.query;
    if (searchText) {
      result.search.query = searchText;
    }

    if (query.fields) {
      try {
        result.search.fields =
          typeof query.fields === 'string'
            ? JSON.parse(query.fields)
            : query.fields;
      } catch {
        result.search.fields = Array.isArray(query.fields)
          ? query.fields
          : [query.fields];
      }
    }

    if (query.operator) {
      result.search.operator = query.operator;
    }
  }

  // Handle price range filters
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    if (!result.filters) {
      result.filters = [];
    }

    if (query.minPrice !== undefined) {
      result.filters.push({
        field: 'originalPrice',
        operator: 'gte',
        value: Number(query.minPrice),
      });
    }

    if (query.maxPrice !== undefined) {
      result.filters.push({
        field: 'originalPrice',
        operator: 'lte',
        value: Number(query.maxPrice),
      });
    }
  }

  // Handle subcategoryId filter
  if (query.subcategoryId) {
    if (!result.filters) {
      result.filters = [];
    }
    result.filters.push({
      field: 'subcategoryId',
      operator: 'eq',
      value: query.subcategoryId,
    });
  }

  // Handle relations - can be array or single value
  if (query.relations) {
    result.relations = Array.isArray(query.relations)
      ? query.relations
      : [query.relations];
  }

  // Handle withDeleted
  if (query.withDeleted !== undefined) {
    result.withDeleted =
      query.withDeleted === 'true' || query.withDeleted === true;
  }

  console.log('Transformed result:', JSON.stringify(result, null, 2));
  return result;
}
