
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
    PROFILE_AVATAR : "/profile/users/avatar",
    PRESCRIPTION : "/profile/prescription",
    DOCTOR_REQUEST_ACTION : "profile/prescription/access-request",
    NOTIFICATIONS : "/notifications",
    PAYMENT : "/payment/vn-pay",
    // Search endpoints
    SEARCH_DOCTOR : "/search/doctor",
    SEARCH_ALL_DOCTORS : "/search/allDoctors",
    SEARCH_SUGGESTIONS : "/search/suggestions"
}

export const PUBLIC_ENDPOINT  = new Set([
    API.REGISTRATION,
    API.LOGIN,
    API.REFRESH,
    API.CHATBOT
]);