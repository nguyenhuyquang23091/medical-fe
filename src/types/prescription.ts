// AccessStatus enum matching backend values
export enum AccessStatus {
    NO_REQUEST = 'NO_REQUEST',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DENIED = 'DENIED'
}

export interface PrescriptionRequest {
    userId: string;
    userProfileId : string;
    doctorId: string;
    status: string;
    imageUrls : string[];
    prescriptionData : PrescriptionData[];
    createdAt: string;
    updatedAt: string;
}

export interface PrescriptionResponse {
    id?: string; // Prescription ID from backend
    userId: string;
    userProfileId : string;
    prescriptionName?: string; // Name of the prescription
    doctorId: string;
    status: string;
    imageURLS? : string[]; // Exact backend field name (all caps "URLS")
    prescriptionData : PrescriptionData[];
    createdAt: string;
    updatedAt: string;

}

export interface PrescriptionUpdateRequest {
    imageUrls? : string[];
    prescriptionData? : PrescriptionData[];
    status? : string;
    updatedAt: string;
}


export interface PrescriptionData {
    // Medication fields (from doctor prescriptions)
    medicationName?: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
    doctorNotes?: string;

    // Blood sugar fields (from patient prescriptions)
    bloodSugarLevel?: string;
    readingType?: string;
    measurementDate?: string;
    bloodSugarCategory?: string;
}


export interface PrescriptionAccessData{
    id?: string,
    prescriptionId: string,
    patientUserId : string,
    doctorUserId : string,
    status : string,
    requestReason: string,
    requestedAt: string,
    respondedAt : string,
    expiresAt : string
}

export interface PrescriptionGeneralData {
    id: string;
    userId: string;
    userProfileId: string;
    prescriptionName : string;
    doctorId: string;
    status: string;
    accessStatus?: AccessStatus | null;
    createdAt: string;
    updatedAt: string;
}

// Patient Prescription Creation Types (matching backend PatientPrescriptionCreateRequest)
export interface PatientPrescriptionDataRequest {
    bloodSugarLevel: string;
    readingType: string; // FASTING, BEFORE_MEAL, AFTER_MEAL, BEDTIME, RANDOM
    measurementDate: string; // ISO-8601 format
    bloodSugarCategory?: string; // LOW, NORMAL, HIGH, VERY_HIGH
}

export interface PatientPrescriptionCreateRequest {
    prescriptionName: string;
    imageURLS: string[]; // Exact backend field name (all caps "URLS")
    prescriptionData: PatientPrescriptionDataRequest[];
}

// Patient Prescription Update Type (matching backend PatientPrescriptionUpdateRequest)
export interface PatientPrescriptionUpdateRequest {
    prescriptionName?: string;
    imageURLS?: string[]; // Exact backend field name (all caps "URLS")
    prescriptionData?: PatientPrescriptionDataRequest[];
}

// Doctor Prescription Data Update (matching backend DoctorPrescriptionDataUpdate)
export interface DoctorPrescriptionDataUpdate {
    medicationName: string; // Required
    dosage: string; // Required
    frequency: string; // Required
    instructions?: string; // Optional
    doctorNotes?: string; // Optional
}

// Doctor Prescription Update Type (matching backend DoctorPrescriptionUpdateRequest)
export interface DoctorPrescriptionUpdateRequest {
    prescriptionData: DoctorPrescriptionDataUpdate[]; // Required, at least one entry
}