// Chatbot-related types and interfaces

export interface ChatbotRequest {
  message: string;
  conversationId?: string | null;
}

export interface ChatMessage {
  content: string;
  isBot: boolean;
}

// Chatbot-specific API response structure
export interface ChatbotApiResponse {
  content: string;
  conversationId: string;
}