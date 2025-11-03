import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse } from "@/types";
import { PrescriptionAccessData, PrescriptionRequest, PrescriptionResponse, PrescriptionUpdateRequest, PrescriptionGeneralData, PatientPrescriptionCreateRequest, PatientPrescriptionUpdateRequest, DoctorPrescriptionUpdateRequest } from "@/types/prescription";

const prescriptionService = {


    createPrescription : async (request : PatientPrescriptionCreateRequest, token: string, files: File[]) => {
            try {
                const formData =  new FormData()

                const requestBlob = new Blob([JSON.stringify(request)], {
                    type: 'application/json'
                })
                formData.append("request", requestBlob)

                for (const file of files){
                    formData.append("prescriptionImages", file)
                }

                const httpClient = createServerApiClient(token);

                const response = await httpClient.post<ApiResponse<PrescriptionResponse>>(
                    `${API.PRESCRIPTION}`,
                    formData
                );

             return response.data.result;

            } catch (error) {
                console.error("Error in creating prescription:", error);
                throw error;
            }
    },

   getMyGeneralPrescriptions : async(token: string) : Promise<PrescriptionResponse[]> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.get<ApiResponse<PrescriptionResponse[]>>(`${API.PRESCRIPTION}/myPrescription`);
            console.log('Get My Prescriptions Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            return response.data.result;
        } catch (error) {
            console.error("Error in fetching prescriptions:", error);
            throw error;
        }
    },

    getMyDetailPrescription : async(prescriptionId: string, token: string) : Promise<PrescriptionResponse> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.get<ApiResponse<PrescriptionResponse>>(`${API.PRESCRIPTION}/myPrescription/${prescriptionId}`);
            console.log('Get My Detail Prescription Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            return response.data.result;
        } catch (error) {
            console.error("Error in fetching prescription details:", error);
            throw error;
        }
    },

    updateMyPrescription : async (prescriptionId: string, request: PatientPrescriptionUpdateRequest, token: string, updateImages?: File[]) : Promise<PrescriptionResponse> => {
        try {
            const formData = new FormData();

            // Match backend @RequestPart(value = "updateRequest")
            const requestBlob = new Blob([JSON.stringify(request)], {
                type: 'application/json'
            });
            formData.append("updateRequest", requestBlob);

            // Match backend @RequestPart(value = "updateImage", required = false)
            if (updateImages && updateImages.length > 0) {
                for (const file of updateImages) {
                    formData.append("updateImage", file);
                }
            }

            const httpClient = createServerApiClient(token);

            const response = await httpClient.put<ApiResponse<PrescriptionResponse>>(
                `${API.PRESCRIPTION}/myPrescription/${prescriptionId}`,
                formData
            );

            console.log('Update My Prescription Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in updating prescription:", error);
            throw error;
        }
    },

    deleteMyPrescription : async (prescriptionId: string, token: string) : Promise<void> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.delete<ApiResponse<void>>(
                `${API.PRESCRIPTION}/myPrescription/${prescriptionId}`
            );

            console.log('Delete My Prescription Response:', response.data);
        } catch (error) {
            console.error("Error in deleting prescription:", error);
            throw error;
        }
    },

    approveDoctorRequest : async(requestId : string, token: string) : Promise<PrescriptionAccessData> => {
        try { 
            const httpClient = createServerApiClient(token);
            const response = await httpClient.put<ApiResponse<PrescriptionAccessData>>(`${API.DOCTOR_REQUEST_ACTION}/${requestId}/approve`);
            
            if(!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in approving doctor request:", error);
            throw error;
        }

    },

    denyDoctorRequest : async(requestId : string, token: string) : Promise<PrescriptionAccessData> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.put<ApiResponse<PrescriptionAccessData>>(`${API.DOCTOR_REQUEST_ACTION}/${requestId}/deny`);

            if(!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in denying doctor request:", error);
            throw error;
        }

    },

    //Doctor authorities
    
    getPatientPrescriptionsList : async(userId: string, token: string) : Promise<PrescriptionGeneralData[]> => {
        try {
            const httpClient = createServerApiClient(token);
            const url = `${API.PRESCRIPTION}/doctor/${userId}`;
            console.log('Calling prescription API with URL:', url);
            console.log('Patient User ID:', userId);
            console.log('Token present:', !!token);

            const response = await httpClient.get<ApiResponse<PrescriptionGeneralData[]>>(url);
            console.log('Get Patient Prescriptions List Response:', response.data);

            if (!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in fetching patient prescriptions list:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : 'Unknown error',
                response: (error as any)?.response?.data,
                status: (error as any)?.response?.status
            });
            throw error;
        }

    },
    
    createPrescriptionAccess : async ( userId : string, prescriptionId : string, token : string, requestReason?: string) : Promise<PrescriptionAccessData> => {
        try {
            const httpClient = createServerApiClient(token);
            const payload = requestReason ? { requestReason } : {};
            const response = await httpClient.post(`${API.PRESCRIPTION}/doctor/${userId}/${prescriptionId}/request-access`, payload);
            console.log('Create Prescription Access Response:', response.data);

            if (!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in creating prescription access:", error);
            throw error;
        }
    },

    // Doctor update prescription (after access granted)
    doctorUpdatePrescription : async (prescriptionId: string, request: DoctorPrescriptionUpdateRequest, token: string) : Promise<PrescriptionResponse> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.put<ApiResponse<PrescriptionResponse>>(
                `${API.PRESCRIPTION}/doctor/prescription/${prescriptionId}`,
                request
            );

            console.log('Doctor Update Prescription Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in doctor updating prescription:", error);
            throw error;
        }
    },

    // Doctor delete prescription (after access granted)
    doctorDeletePrescription : async (prescriptionId: string, token: string) : Promise<void> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.delete<ApiResponse<void>>(
                `${API.PRESCRIPTION}/doctor/prescription/${prescriptionId}`
            );

            console.log('Doctor Delete Prescription Response:', response.data);
        } catch (error) {
            console.error("Error in doctor deleting prescription:", error);
            throw error;
        }
    },

    // Doctor get one patient's detailed prescription (after access granted)
    getOnePatientDetailPrescription : async (patientId: string, prescriptionId: string, token: string) : Promise<PrescriptionResponse> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.get<ApiResponse<PrescriptionResponse>>(
                `${API.PRESCRIPTION}/doctor/${patientId}/${prescriptionId}`
            );

            console.log('Get One Patient Detail Prescription Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in fetching patient prescription detail:", error);
            throw error;
        }
    }
}
export default prescriptionService;
