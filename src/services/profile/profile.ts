import httpClient from "@/lib/apiClient";
import { API } from "@/lib/config/configuration";

export interface ProfileUpdateRequest {
     firstName : string
     lastName : string
     city : string 
     dob : string
}
interface ApiResponse {
    code : number
    result : {
        id: string;
        userId : string
        firstName: string
        lastName: string
        city: string
        dob: string
    }
}
const profileService = {
    getProfile : async () : Promise<ApiResponse> => {
        try {
            const response = await httpClient.get<ApiResponse>(API.PROFILE);
            console.log('API Response:', response.data);
            const result = response.data.result;

            return {
                code : response.data.code,
                result : {
                    id : result.id,
                    userId : result.userId,
                    firstName : result.firstName,
                    lastName : result.lastName, 
                    city : result.city,
                    dob: result.dob
            }
        };
    } catch (error) {
        console.error("Error in fetching profile:", error);
        throw error;
    }  
}, 
    updateProfile : async (request : ProfileUpdateRequest) : Promise<ApiResponse> => {
        try {
            const response = await httpClient.put<ApiResponse>(API.PROFILE, request);
            console.log('Api Respone', response.data)

            const result = response.data.result;
            return {
                code : response.data.code,
                result : {
                    id : result.id,
                    userId : result.userId,
                    firstName : result.firstName,
                    lastName : result.lastName, 
                    city : result.city,
                    dob: result.dob
                }
            }
        } catch (error) {
            console.error("Error in updating profile:", error);
            throw error;
        }
    }     
}
export default profileService;