
export const API_GATEWAY_URL = {BASE_URL : "http://localhost:8888/api/v1"};

// Socket.IO URLs for different microservices
export const WEBSOCKET_URLS = {
  NOTIFICATIONS: "http://localhost:9092",  // Notification delivery service
  PAYMENTS: "http://localhost:9093",       // Payment status service
} as const;

// Legacy support - defaults to notifications socket
export const WEBSOCKET_URL = WEBSOCKET_URLS.NOTIFICATIONS;

export const API = {

    REGISTRATION : "/identity/users/registration",
    LOGIN: "/identity/auth/login",
    REFRESH: "/identity/auth/refresh",
    LOGOUT: "/identity/auth/logout",
    CHATBOT: "/chatbot/ai/generate",
    PROFILE : "/profile/users",
    GET_AUTH_PROFILE : "/identity/users/my-info",
    GET_ONE_DOCTOR_PROFILE : "/profile/doctorProfile/getOneDoctorProfile",
    UPDATE_AUTH_PROFILE : "/identity/users/my-info",
    PROFILE_AVATAR : "/profile/users/avatar",
    PRESCRIPTION : "/profile/prescription",
    DOCTOR_REQUEST_ACTION : "profile/prescription/access-request",
    NOTIFICATIONS : "/notifications",
    PAYMENT : "/payment/vn-pay",
    // Search endpoints
    SEARCH_DOCTOR : "/search/doctor",
    SEARCH_ALL_DOCTORS : "/search/allDoctors",
    SEARCH_SUGGESTIONS : "/search/suggestions",
    



    

    APPOINTMENT : "/appointment"
}

export const PUBLIC_ENDPOINT  = new Set([
    API.REGISTRATION,
    API.LOGIN,
    API.REFRESH,
    API.CHATBOT
]);