import httpClient from "@/lib/apiClient";
import { API } from "@/lib/config/configuration";
import { ChatbotRequest, ChatMessage, ChatbotApiResponse } from "@/types";

const CONVERSATION_ID_KEY = "chatbot_conversation_id";

const chatbotService = {
    // Get stored conversation ID
    getConversationId: (): string | null => {
        return localStorage.getItem(CONVERSATION_ID_KEY);
    },

    // Main ask function
    ask: async (content: string): Promise<ChatbotApiResponse> => {
        try {
            // Get existing conversation ID if available
            const conversationId = chatbotService.getConversationId();
            
            // Prepare request matching BE DTO
            const request: ChatbotRequest = {
                content,
                conversationId: conversationId
            };

            console.log('Sending request to chatbot API:', request);
            // Make API call and return an ApiResponse similar to BE
            const response = await httpClient.post<ChatbotApiResponse>(API.CHATBOT, request);
            console.log('API Response:', response.data);
          
         
            
            // Check if we have a valid response structure
            if (!response.data || !response.data.result) {
                throw new Error('Invalid response structure from API');
            }
            
            // Extract the nested result
            const result = response.data.result;
            
            // Store new conversation ID if provided
            if (result.conversationId) {
                localStorage.setItem(CONVERSATION_ID_KEY, result.conversationId);
            }

            return response.data;
        } catch (error) {
            console.error("Error in chatbot communication:", error);
            throw error;
        }
    }
};

export default chatbotService;
