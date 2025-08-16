// Profile-related types and interfaces

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  city: string;
  dob: string;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  avatar: string;
  lastName: string;
  city: string;
  dob: string;
}