// Search-related types based on backend DTOs

export enum SuggestionType {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
  SERVICE = 'SERVICE',
  HOSPITAL = 'HOSPITAL',
  LOCATION = 'LOCATION'
}



export interface SearchSuggestion {
  text: string;
  type: SuggestionType;
  matchCount: number;
  score: number;
  entityId: string;
  description?: string;
}

export interface SearchFilter {
  // Autocomplete term (2-100 characters)
  term?: string;

  // Boolean filters
  isAvailable?: boolean;

  // Language filters (cannot be empty if provided)
  languages?: string[];

  // Range filters - Experience (0-100)
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;

  // Range filters - Price (BigDecimal in Java, number in TS)
  minPrice?: number;
  maxPrice?: number;

  // Nested filters - Specialty IDs (Long[] in Java, number[] in TS)
  specialtyIds?: number[];

  // Location filters
  country?: string; // 2-100 characters
  location?: string; // 2-200 characters
}

// Doctor Profile Response Types
export interface ServiceResponse {
  relationshipId: number;
  serviceId: number;
  serviceName: string;
  price: number;
  currency: string;
  displayOrder: number;
}

export interface SpecialtyResponse {
  relationshipId: number;
  specialtyId: number;
  specialtyName: string;
  specialtyCode: string;
  specialtyDescription: string;
  isPrimary: boolean;
  certificationDate?: string;
  certificationBody?: string;
  yearsOfExperienceInSpecialty?: number;
}

export interface ExperienceResponse {
  relationshipId: number;
  experienceId: string;
  hospitalName: string;
  hospitalLogo?: string;
  department: string;
  location: string;
  country: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  displayOrder: number;
  isHighlighted: boolean;
}

export interface DoctorProfileResponse {
  doctorProfileId: string;
  userId: string;

  // Basic doctor information
  fullName?: string | null;
  email?: string | null;
  avatar?: string | null;
  residency?: string | null;
  yearsOfExperience?: number | null;
  bio?: string | null;
  isAvailable: boolean;
  languages?: string[] | null;

  // Nested objects (can be null or empty from backend)
  services?: ServiceResponse[] | null;
  specialties?: SpecialtyResponse[] | null;
  experiences?: ExperienceResponse[] | null;
}

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}
