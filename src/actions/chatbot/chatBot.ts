import { createServerApiClient } from "@/lib/serverApiClient";
import { API } from "@/lib/config/configuration";
import { ChatbotRequest, ChatMessage, ChatbotApiResponse } from "@/types";

const CONVERSATION_ID_KEY = "chatbot_conversation_id";

const chatbotService = {
    // Get stored conversation ID
    getConversationId: (): string | null => {
        return localStorage.getItem(CONVERSATION_ID_KEY);
    },

    // Main ask function
    ask: async (message: string, token: string): Promise<ChatbotApiResponse> => {
        try {
            // Get existing conversation ID if available
            const conversationId = chatbotService.getConversationId();

            // Prepare request matching BE DTO
            const request: ChatbotRequest = {
                message: message,
                conversationId: conversationId
            };

            console.log('Sending request to chatbot API:', request);
            // Make API call and return an ApiResponse similar to BE
            const httpClient = createServerApiClient(token);
            const response = await httpClient.post<ChatbotApiResponse>(API.CHATBOT, request);
            console.log('API Response:', response.data);
            
            // Check if we have a valid response structure
            if (!response.data || !response.data.content || !response.data.conversationId) {
                throw new Error('Invalid response structure from API');
            }
            
            // Store new conversation ID if provided
            if (response.data.conversationId) {
                localStorage.setItem(CONVERSATION_ID_KEY, response.data.conversationId);
            }

            return response.data;
        } catch (error) {
            console.error("Error in chatbot communication:", error);
            throw error;
        }
    }
};

export default chatbotService;
