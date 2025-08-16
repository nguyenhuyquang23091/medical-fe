import httpClient from "@/lib/apiClient";
import { API } from "@/lib/config/configuration";
import { ProfileUpdateRequest, ProfileResponse, ApiResponse } from "@/types";


const profileService = {
    getProfile: async (): Promise<ProfileResponse> => {
        try {
            const response = await httpClient.get<ApiResponse<ProfileResponse>>(`${API.PROFILE}/my-profile`);
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
            const response = await httpClient.put<ApiResponse<ProfileResponse>>(`${API.PROFILE}/my-profile`, request);
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
    
    updateProfileAvatar: async(avatar : FormData) => {
        try { 
           const response =  await httpClient.put<ApiResponse<ProfileResponse>>(`${API.UPDATE_PROFILE_AVATAR}`, avatar, {
                headers : {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data.result;
        } catch(error){
            console.error("Error in updating profile avatar:", error);
            throw error;
        }
    }

};

export default profileService;