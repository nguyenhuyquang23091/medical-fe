"use client";

import { createClientApiClient } from "@/lib/clientApiClient";
import { getSession } from "next-auth/react";
import { API } from "@/lib/config/configuration";
import { ProfileResponse, IdentityResponse, ApiResponse } from "@/types";

//client service 
export const profileClient = {
  
    getProfile: async (): Promise<ProfileResponse> => {
        try {
           
            console.log("Before getSession call");
            const session = await getSession();
            console.log("After first getSession call");

            // Force another session check to trigger JWT callback
            await new Promise(resolve => setTimeout(resolve, 100));
            const session2 = await getSession();
            console.log("After second getSessiosn call");

            console.log("Profile getSession result:", {
                hasSession: !!session2,
                hasToken: !!session2?.accessToken,
                tokenLength: session2?.accessToken?.length,
                error: session2?.error,
                currentTime: Date.now()
            });
            const token = session2?.accessToken;

            if (!token) {
                throw new Error("No access token available");
            }

            const apiClient = createClientApiClient(token);
            const response = await apiClient.get<ApiResponse<ProfileResponse>>(`${API.PROFILE}/my-profile`);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in fetching profile:", error);
            throw error;
        }
    },

 
    getAuthInfo: async (): Promise<IdentityResponse> => {
        try {
            const session = await getSession();
            console.log("AuthInfo getSession result:", {
                hasSession: !!session,
                hasToken: !!session?.accessToken,
                tokenLength: session?.accessToken?.length,
                error: session?.error
            });
            const token = session?.accessToken;

            if (!token) {
                throw new Error("No access token available");
            }

            const apiClient = createClientApiClient(token);
            const response = await apiClient.get<ApiResponse<IdentityResponse>>(API.GET_AUTH_PROFILE);

            return response.data.result;
        } catch (error) {
            console.error("Error in fetching auth info:", error);
            throw error;
        }
    }
};