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
