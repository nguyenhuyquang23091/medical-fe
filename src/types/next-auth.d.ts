import { Session } from "next-auth";


//config file to declare variable types
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
    
    interface User {
        accessToken?: string;
        authenticated?: boolean;
    }
    
    // Custom error interface for authentication errors
    interface AuthError {
        errorCode: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
    }
} 

// Global interface for custom errors
interface CustomApiError {
    errorCode: number;
} 