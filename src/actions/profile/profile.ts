import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ProfileUpdateRequest, ProfileResponse, ApiResponse } from "@/types";

const profileService = {
    updateProfile: async (request: ProfileUpdateRequest, token: string): Promise<ProfileResponse> => {
        try {
            const apiClient = createServerApiClient(token);
            const response = await apiClient.put<ApiResponse<ProfileResponse>>(`${API.PROFILE}/my-profile`, request);
            console.log('API Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }
            return response.data.result;
        } catch (error) {
        console.error("Error in updating profile:", error);
            throw error;
        }
    },

    updateProfileAvatar: async (avatar: FormData, token: string): Promise<ProfileResponse> => {
        try {
            const apiClient = createServerApiClient(token);

            // FormData will be auto-detected by the interceptor and Content-Type will be removed
            const response = await apiClient.put<ApiResponse<ProfileResponse>>(`${API.PROFILE_AVATAR}`, avatar);
            return response.data.result;
        } catch (error) {
            console.error("Error in updating profile avatar:", error);
            throw error;
        }
    },
    

    deleteProfileAvatar : async (token : string) : Promise<ProfileResponse> => {
        try { 
            const apiClient = createServerApiClient(token);
            const response = await apiClient.delete<ApiResponse<ProfileResponse>>(`${API.PROFILE_AVATAR}`)
            
            if(!response.data || !response.data.result){
                throw new Error("Invalid response format")
            }

            return response.data.result
        } catch(error){
            console.error("Errow while deleting profile", error)
            throw error;
        }
    }
};

export default profileService;