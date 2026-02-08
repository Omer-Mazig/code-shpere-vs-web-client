export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  method: string;
  errorCode: string;
  message: string;
  timestamp: string;
}
