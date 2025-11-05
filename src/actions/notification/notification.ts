import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse, PageResponse } from "@/types";
import { NotificationMessage } from "@/types/notification";

const notificationService  = {
    getMyNotifications : async(token : string, page: number = 1, size: number = 10) : Promise<PageResponse<NotificationMessage>> => {
        try {
            const httpClient = createServerApiClient(token)
            const response = await httpClient.get<ApiResponse<PageResponse<NotificationMessage>>>(`${API.NOTIFICATIONS}/my-notifications`, {
                params: { page, size }
            });

            if(!response.data || !response.data.result){
                throw new Error("Invalid Response");
            }

            const result = response.data.result;
            
            if (!result.data || !Array.isArray(result.data)) {
                throw new Error("Invalid Response: expected PageResponse");
            }

            return result;

        } catch (error){
            console.error("Error while getting notifications", error);
            throw error;
        }
    },
    
    markAsRead : async(token: string, notificationId: string) : Promise<NotificationMessage> => {
        try {
            const httpClient = createServerApiClient(token)
            const response = await httpClient.put<ApiResponse<NotificationMessage>>(`${API.NOTIFICATIONS}/my-notifications/${notificationId}`);

            if(!response.data || !response.data.result){
                throw new Error("Invalid Response");
            }

            return response.data.result;
        } catch (error){
            console.error("Error while marking notification as read", error)
            throw error
        }
    },

    deleteNotification : async( token : string, notificationId : string ) : Promise<void> => {
        try {
            const httpClient = createServerApiClient(token)
            const response = await httpClient.delete(`${API.NOTIFICATIONS}/${notificationId}`);

            if(response.status !== 200 && response.status !== 204){
                throw new Error("Failed to delete notification")
            }
        } catch(error){
            console.error("Error while deleting notification", error)
            throw error
        }
    }
}

export default notificationService;