// Common API response types used across all services

export interface ApiResponse<T = any> {
  code: number;
  result: T;
}

// Generic error response structure
export interface ApiError {
  code: number;
  message?: string;
}