// Authentication-related types and interfaces

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  dob: string;
}

export interface AuthDataUpdateRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  token: string;
}

export interface IdentityResponse {
  id: string;
  username: string;
  email: string;
}

// NextAuth session and user extensions
export interface ExtendedSession {
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
  role?: string;
  error?: string;
}

export interface ExtendedUser {
  role?: string;
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
  authenticated?: boolean;
  accessTokenExpires?: number; // Token expiration timestamp in milliseconds from backend
}

export interface AuthError {
  errorCode: number;
}

// JWT token interface
export interface ExtendedJWT {
  accessToken?: string;
  refreshToken?: string;
  role?: string;
  authenticated?: boolean;
  accessTokenExpires?: number;
  error?: string;
}

// Custom API error interface
export interface CustomApiError {
  errorCode: number;
}