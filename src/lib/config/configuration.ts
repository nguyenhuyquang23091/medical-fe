
export const API_GATEWAY_URL = {BASE_URL : "http://localhost:8888/api/v1"};

export const WEBSOCKET_URL = "http://localhost:9092";

export const API = {
    REGISTRATION : "/identity/users/registration",
    LOGIN: "/identity/auth/login",
    REFRESH: "/identity/auth/refresh",
    LOGOUT: "/identity/auth/logout",
    CHATBOT: "/chatbot/ai/generate",
    PROFILE : "/profile/users",
    GET_AUTH_PROFILE : "/identity/users/my-info",
    UPDATE_AUTH_PROFILE : "/identity/users/my-info",
    UPDATE_PROFILE_AVATAR : "/profile/users/avatar",
    PRESCRIPTION : "/profile/prescription"
}

export const PUBLIC_ENDPOINT  = new Set([
    API.REGISTRATION,
    API.LOGIN,
    API.REFRESH,
    API.CHATBOT
]);