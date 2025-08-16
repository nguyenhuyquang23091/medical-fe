
export const API_GATEWAY_URL = {BASE_URL : "http://localhost:8888/api/v1"};

export const API = {
    REGISTRATION : "/identity/users/registration",
    LOGIN: "/identity/auth/token",
    LOGOUT: "/identity/auth/logout",
    CHATBOT: "/chatbot/chat",
    PROFILE : "/profile/users",
    GET_AUTH_PROFILE : "/identity/users/my-info",
    UPDATE_AUTH_PROFILE : "/identity/users/my-info",
    UPDATE_PROFILE_AVATAR : "/profile/users/avatar"
}

export const PUBLIC_ENDPOINT  = new Set([ 
    API.REGISTRATION,
    API.LOGIN, 
    API.CHATBOT
]);