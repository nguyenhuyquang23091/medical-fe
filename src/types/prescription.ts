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
     userId: string;
    userProfileId : string;
    doctorId: string;
    status: string;
    imageUrls? : string[];
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

interface PrescriptionData {
    medicationName : string,
    dosage : string,
    frequency : string,
    instructions : string,
    doctorNotes : string
}


export interface PrescriptionAccessData{
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
    createdAt: string;
    updatedAt: string;
}