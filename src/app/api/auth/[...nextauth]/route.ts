
import httpClient from "@/lib/apiClient";
import { ERROR_MESSAGES } from "@/lib/errors/errorCode";
import axios from "axios";
import { API } from "@/lib/config/configuration";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"


export const {handlers, signIn, signOut, auth} = NextAuth({
    providers : [
        Credentials({
             credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            }, 
            authorize : async ( credentials) =>{
                try {
                    console.log("Attempting login with:", credentials?.identifier);
                    const identifier = typeof credentials?.identifier === "string" ? credentials.identifier : '';
                    
                    const res = await httpClient.post(API.LOGIN, {
                        email : identifier.includes('@') ? identifier : null,
                        username: identifier.includes('@') ? null : identifier,
                        password: credentials?.password
                    });
                    
                    console.log("Login response:", res.data);
                    const result = res.data?.result;

                    if (result?.token) {
                        return {
                            id: result?.userId || "placeholder",
                            accessToken: result.token,
                            authenticated: result.authenticated,
                        };
                    }
                
                 throw new Error(ERROR_MESSAGES[1006]);

                } catch (error) {
                    console.error("Login error in authorize:", error);
                    if (axios.isAxiosError(error)){
                        const code = error.response?.data.code || 9999;
                        throw new Error(ERROR_MESSAGES[code]);
                    } else if (error instanceof Error){
                        throw error;
                    }
                    throw new Error(ERROR_MESSAGES[9999]);
                }
            } 
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("Setting JWT token with user data", user);
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Setting session with token data", token);
            session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
            return session;
        }
    },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/',
        error: '/',  
    }
    
})
export const { GET, POST } = handlers




