import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse } from "@/types";
import { PrescriptionAccessData, PrescriptionRequest, PrescriptionResponse, PrescriptionUpdateRequest, PrescriptionGeneralData } from "@/types/prescription";

const prescriptionService = {
    createPrescription : async (request : PrescriptionRequest, token: string) => {
            try {
                const httpClient = createServerApiClient(token);
                const response = await httpClient.post<ApiResponse<PrescriptionResponse>>(`${API.PRESCRIPTION}`, request);
                console.log('Prescription Response:', response.data);

                if (!response.data || !response.data.result){
                    throw new Error('Invalid response format');
                
                }
                return response.data.result;
            } catch (error) {
                console.error("Error in creating prescription:", error);
                throw error;
            }
    },

    getMyPrescriptions : async(token: string) : Promise<PrescriptionResponse[]> => {
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



    updateMyPrescriptions : async(prescriptionId: string, updateRequest: PrescriptionUpdateRequest, token: string) : Promise<PrescriptionResponse> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.put<ApiResponse<PrescriptionResponse>>(`${API.PRESCRIPTION}/myPrescription/${prescriptionId}`, updateRequest);

            console.log('Update My Prescriptions Response:', response.data);

            if (!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in updating prescriptions:", error);
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
    
    createPrescriptionAccess : async ( userId : string, prescriptionId : string, token : string) : Promise<PrescriptionAccessData> => {
        try {
            const httpClient = createServerApiClient(token);
            const response = await httpClient.post(`${API.PRESCRIPTION}/doctor/${userId}/${prescriptionId}/request-access`);
            console.log('Create Prescription Access Response:', response.data);

            if (!response.data || !response.data.result){
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in creating prescription access:", error);
            throw error;
        }
    }
}
export default prescriptionService;
