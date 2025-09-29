import { createServerApiClient } from "@/lib/serverApiClient";
import httpClient from "@/lib/clientApiClient";
import { getSession } from "next-auth/react";
import axios from "axios";
import { API } from "@/lib/config/configuration";
import { RegisterData, AuthDataUpdateRequest, IdentityResponse, ApiResponse } from "@/types";


const authService = {
    register: async(credentials : RegisterData) :Promise<ApiResponse<IdentityResponse>> => {

        // for registeration, the credentials should 
        // set to be false, no one want extra layer 
        // of security when registering
        try {
            const registerResponse = await httpClient.post(API.REGISTRATION, credentials, 
                {withCredentials : false}
            )
            return registerResponse.data;
        } catch(error){
           if( axios.isAxiosError(error)){
           throw {code : error.response?.data.code || 9999}
           } else if ( error instanceof Error){
            console.error("Error while registering", error);
            throw error;
           }
           throw {code:9999}
        }
    },
    
    getInfo: async (token?: string): Promise<IdentityResponse> => {
        try {
            // If no token provided, get it from session
            if (!token) {
                const session = await getSession();
                token = session?.accessToken;
            }

            const apiClient = createServerApiClient(token!);
            const authData = await apiClient.get<ApiResponse<IdentityResponse>>(API.GET_AUTH_PROFILE);
            return authData.data.result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw { code: error.response?.data.code || 9999 }
            } else if (error instanceof Error) {
                console.error("Error while fetching", error);
                throw error;
            }
            throw { code: 9999 }
        }
    },

    updateInfo: async (credentials: AuthDataUpdateRequest, token?: string): Promise<IdentityResponse> => {
        try {
            // If no token provided, get it from session
            if (!token) {
                const session = await getSession();
                token = session?.accessToken;
            }

            const apiClient = createServerApiClient(token!);
            const response = await apiClient.put<ApiResponse<IdentityResponse>>(API.UPDATE_AUTH_PROFILE, credentials);
            return response.data.result;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw { code: error.response?.data.code || 9999 }
            } else if (error instanceof Error) {
                console.error("Error while fetching", error);
                throw error;
            }
            throw { code: 9999 }
        }
    },

    signOut: async (token?: string): Promise<void> => {
        try {
            // If no token provided, get it from session
            if (!token) {
                const session = await getSession();
                token = session?.accessToken;
            }

            const apiClient = createServerApiClient(token!);
            await apiClient.post(API.LOGOUT, { token });
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



