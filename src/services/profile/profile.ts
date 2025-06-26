import httpClient from "@/lib/apiClient";
import { API } from "@/lib/config/configuration";

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
    lastName: string;
    city: string;
    dob: string;
}

interface ApiResponse {
    code: number;
    result: ProfileResponse;
}

const profileService = {
    getProfile: async (): Promise<ProfileResponse> => {
        try {
            const response = await httpClient.get<ApiResponse>(`${API.PROFILE}/my-profile`);
            console.log('API Response:', response.data);
            
            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            
            return response.data.result;
        } catch (error) {
            console.error("Error in fetching profile:", error);
            throw error;
        }
    },
    
    updateProfile: async (request: ProfileUpdateRequest): Promise<ProfileResponse> => {
        try {
            const response = await httpClient.put<ApiResponse>(`${API.PROFILE}/my-profile`, request);
            console.log('API Response:', response.data);
            
            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            
            return response.data.result;
        } catch (error) {
            console.error("Error in updating profile:", error);
            throw error;
        }
    }
};

export default profileService;