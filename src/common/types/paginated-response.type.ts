export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
