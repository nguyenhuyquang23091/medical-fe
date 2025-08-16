import { ERROR_MESSAGES } from "@/lib/errors/errorCode";
import httpClient from "@/lib/apiClient";
import axios from "axios";
import { API } from "@/lib/config/configuration";
import { RegisterData, AuthDataUpdateRequest, IdentityResponse, ApiResponse } from "@/types";
import { auth } from "@/lib/auth";

 



const authService = {
   
    register: async(credentials : RegisterData) :Promise<ApiResponse<IdentityResponse>> => {

        // for registeration, the credentials should set to be false, no one want extra layer of security when registering
        try {
            const registerResponse = await httpClient.post(API.REGISTRATION, credentials, 
                {withCredentials : false}
            )
            return registerResponse.data;
        } catch(error){
           if( axios.isAxiosError(error)){
           throw {code : error.response?.data.code || 9999}
           } else if ( error instanceof Error){
            console.error("Error while regiring", error);
            throw error;
           }
           throw {code:9999}
          
        }
    },
    getInfo : async():Promise<IdentityResponse> => {
        try {
            const authData = await httpClient.get<ApiResponse<IdentityResponse>>(API.GET_AUTH_PROFILE);
            return authData.data.result;
        } catch(error){
            if( axios.isAxiosError(error)){
            throw {code : error.response?.data.code || 9999}
            } else if ( error instanceof Error){
             console.error("Error while fetching", error);
             throw error;
            }
            throw {code:9999}
           
         }
    },

    updateInfo : async(credentials : AuthDataUpdateRequest) :Promise<IdentityResponse> => {
        try {
            const response  = await httpClient.put<ApiResponse<IdentityResponse>>(API.UPDATE_AUTH_PROFILE, credentials);
            return response.data.result;
        }catch(error){
            if( axios.isAxiosError(error)){
            throw {code : error.response?.data.code || 9999}
            } else if ( error instanceof Error){
             console.error("Error while fetching", error);
             throw error;
            }
            throw {code:9999}
           
         }
     },
     
    signOut: async (token: string) : Promise<void> =>{
        const session = await auth();
        const accessToken = session?.accessToken;
        try { 
            await httpClient.post(API.LOGOUT, accessToken);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw { code: error.response?.data.code || 9999 };
            } else if (error instanceof Error) {
                console.error("Error while logging out", error);
                throw error;
            }
            throw { code: 9999 };
        }
    }
  
}
export default authService;



