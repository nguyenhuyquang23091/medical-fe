import {BaseProfile} from "./baseProfile";

/**
 * Doctor Profile Response - matches backend DoctorProfileResponse
 * Contains all doctor information including nested services, specialties, and experiences
 */
export interface DoctorProfileResponse extends BaseProfile {
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


// Backend DTO: DoctorServiceResponse
export interface ServiceResponse {
  relationshipId: number; // Long in BE
  service: MedicalServiceResponse;
  price: number; // BigDecimal in BE, mapped to number
  currency: string;
  displayOrder: number; // Integer in BE
}

// Backend DTO: MedicalServiceResponse
export interface MedicalServiceResponse {
  id: string;
  name: string;
}

// Backend DTO: DoctorSpecialtyResponse
export interface SpecialtyResponse {
  relationshipId: number; // Long in BE
  specialty: SpecialtyDetailResponse;
  isPrimary: boolean; // Boolean in BE
  certificationDate?: string; // LocalDate in BE, ISO string format
  certificationBody?: string;
  yearsOfExperienceInSpecialty?: number; // Integer in BE
}

// Backend DTO: SpecialtyResponse
export interface SpecialtyDetailResponse {
  id: string;
  name: string;
  code: string;
  description: string;
}

// Backend DTO: DoctorExperienceResponse
export interface ExperienceResponse {
  relationshipId: number; // Long in BE
  experience: PracticeExperienceResponse;
  displayOrder: number; // Integer in BE
  isHighlighted: boolean; // Boolean in BE
}

// Backend DTO: PracticeExperienceResponse
export interface PracticeExperienceResponse {
  id: string;
  hospitalName: string;
  hospitalLogo?: string;
  department: string;
  location: string;
  country: string;
  position: string;
  startDate: string; // LocalDate in BE, ISO string format
  endDate?: string; // LocalDate in BE, ISO string format (nullable)
  isCurrent: boolean; // Boolean in BE
  description?: string;
  displayOrder: number; // Integer in BE
}