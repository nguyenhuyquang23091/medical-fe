export const API_GATEWAY_URL = {BASE_URL : "http://localhost:8888/api/v1"};

export const API = {
    REGISTRATION : "/identity/users/registration",
    LOGIN: "/identity/auth/token",
    CHATBOT: "/chatbot/chat",
    PROFILE : "/profile/users"
}

export const PUBLIC_ENDPOINT  = new Set([
    API.REGISTRATION,
    API.LOGIN
]);