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

export interface IdentityResponse {
  id: string;
  username: string;
  email: string;
}

// NextAuth session and user extensions
export interface ExtendedSession {
  accessToken?: string | undefined;
}

export interface ExtendedUser {
  accessToken?: string | undefined;
  authenticated?: boolean;
}

export interface AuthError {
  errorCode: number;
}

// JWT token interface
export interface ExtendedJWT {
  accessToken?: string;
}

// Custom API error interface
export interface CustomApiError {
  errorCode: number;
}