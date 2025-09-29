import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { Patient, PatientListResponse, PatientFilters, ApiResponse } from "@/types";

const patientService = {

    getAllPatients: async (token: string): Promise<Patient[]> => {
        try {
            const apiClient = createServerApiClient(token);

            const response = await
            apiClient.get<ApiResponse<Patient[]>>(`${API.PROFILE}/get-all-patients`);
            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            console.log("All Patient Data", response.data.result);

            return response.data.result;
        } catch (error) {
            console.error("Error fetching patients:", error);
            throw error;
        }
    },

    getPatientById: async (patientId: string, token: string): Promise<Patient> => {
        try {
            const apiClient = createServerApiClient(token);
            const url = `${API.PROFILE}/${patientId}`;
            console.log('Calling getPatientById with URL:', url);
            console.log('Patient ID (userId):', patientId);

            const response = await apiClient.get<ApiResponse<Patient>>(url);
            console.log('getPatientById response:', response.data);

            if (!response.data || !response.data.result) {
                console.error('Invalid response format - missing data or result');
                console.error('Full response:', JSON.stringify(response.data, null, 2));
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error fetching patient:", error);
            throw error;
        }
    }
};

export default patientService;