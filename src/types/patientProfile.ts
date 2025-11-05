import {BaseProfile} from "./baseProfile";
export interface Patient extends BaseProfile {
}

export interface PatientListResponse {
  patients: Patient[];
}

export interface PatientFilters {
  search?: string;
  status?: string;
  sortBy?: 'name' | 'dob' | 'id';
  sortOrder?: 'asc' | 'desc';
}