import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ApiResponse } from "@/types";

export interface NotificationRequest {
    patientId: string;
    prescriptionId: string;
    message?: string;
    notificationType?: string;
}

const notificationService = {
    sendNotification: async (request: NotificationRequest, token: string): Promise<any> => {
        try {
            const httpClient = createServerApiClient(token);

            // Prepare notification request
            const notificationData = {
                patientId: request.patientId,
                prescriptionId: request.prescriptionId,
                message: request.message || "Doctor requesting access to prescription",
                notificationType: request.notificationType || "ACCESS_REQUEST"
            };

            console.log('Sending notification request:', notificationData);

            const response = await httpClient.post<ApiResponse<any>>(`${API.NOTIFICATION}/send-notification`, notificationData);
            console.log('Notification Response:', response.data);

            if (!response.data || !response.data.result) {
                throw new Error('Invalid response format');
            }

            return response.data.result;
        } catch (error) {
            console.error("Error in sending notification:", error);
            throw error;
        }
    }
};

export default notificationService;