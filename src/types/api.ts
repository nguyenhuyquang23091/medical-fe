// Common API response types used across all services

export interface ApiResponse<T = any> {
  code: number;
  result: T;
}


export interface PageResponse<T> {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    data: T[];
}

// Generic error response structure
export interface ApiError {
  code: number;
  message?: string;
}