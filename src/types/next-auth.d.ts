import { Session } from "next-auth";
import { ExtendedSession, ExtendedUser, AuthError, ExtendedJWT, CustomApiError } from "./auth";

//config file to declare variable types
declare module "next-auth" {
    interface Session extends ExtendedSession {
     
    }

    interface User extends ExtendedUser {}

    // Re-export the AuthError interface
    interface AuthError extends AuthError {}
}

declare module "next-auth/jwt" {
    interface JWT extends ExtendedJWT {

    }
} 